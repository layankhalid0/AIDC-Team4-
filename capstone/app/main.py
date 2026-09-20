"""serving-stack: the FastAPI service (week 2, CPU, tiny model).

This is the starter. GET /health is done for you and works as soon as the model
loads: treat it as the worked example. Your job is the two routes marked TODO.
Correctness before speed. The model runs on CPU this week; do not add a GPU.

Run it:
    uvicorn main:app --host 0.0.0.0 --port 8000

Model: Qwen/Qwen3-8B
"""

from __future__ import annotations

import os
import re
import time
import uuid

import torch
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Security,
    status,
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from transformers import AutoModelForCausalLM, AutoTokenizer

from schemas import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    HealthResponse,
    ModelList,
    ModelCard,
    Choice,
    ResponseMessage,
    Usage,
)


# ---------------------------------------------------------------------------
# API key authentication
# ---------------------------------------------------------------------------

security = HTTPBearer()


def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    expected_key = os.environ.get("API_KEY", "your-secret-key")

    if credentials.credentials != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )

    return credentials.credentials


# ---------------------------------------------------------------------------
# Model setup
# ---------------------------------------------------------------------------

MODEL_ID = os.environ.get("MODEL_ID", "Qwen/Qwen3-8B")

app = FastAPI(title="serving-stack", version="wk2")


# Load once at import time. CPU only this week.
print(f"loading {MODEL_ID} on cpu ...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
)

model.to("cpu")
model.eval()

print("model ready")


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness and readiness."""

    return HealthResponse(
        status="ok",
        model=MODEL_ID,
    )


# ---------------------------------------------------------------------------
# GET /v1/models
# ---------------------------------------------------------------------------

@app.get("/v1/models", response_model=ModelList)
def list_models(
    token: str = Depends(verify_api_key),
) -> ModelList:
    """List the served model id(s)."""

    return ModelList(
        data=[
            ModelCard(
                id=MODEL_ID,
                created=int(time.time()),
            )
        ]
    )


# ---------------------------------------------------------------------------
# POST /v1/chat/completions
# ---------------------------------------------------------------------------

@app.post("/v1/chat/completions")
def chat_completions(
    req: ChatCompletionRequest,
    token: str = Depends(verify_api_key),
) -> ChatCompletionResponse:
    """Run the model over the messages and return an OpenAI-compatible completion."""

    # -----------------------------------------------------------------------
    # Streaming
    # -----------------------------------------------------------------------

    if req.stream:

        def generate_stream():
            messages = [m.model_dump() for m in req.messages]

            if messages and messages[-1]["role"] == "user":
                messages[-1]["content"] += " /no_think"

            input_ids = tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt",
            )

            with torch.no_grad():
                out = model.generate(
                    input_ids,
                    max_new_tokens=req.max_tokens,
                    do_sample=req.temperature > 0,
                    temperature=(
                        req.temperature
                        if req.temperature > 0
                        else None
                    ),
                )

            new_tokens = out[0][input_ids.shape[1]:]

            for token in new_tokens:
                text = tokenizer.decode(
                    [token],
                    skip_special_tokens=True,
                )

                if text:
                    yield f"data: {text}\n\n"

            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
        )

    # -----------------------------------------------------------------------
    # Validate model
    # -----------------------------------------------------------------------

    if req.model != MODEL_ID:
        raise HTTPException(
            status_code=400,
            detail="model_not_found",
        )

    # -----------------------------------------------------------------------
    # Build prompt
    # -----------------------------------------------------------------------

    messages = [m.model_dump() for m in req.messages]

    # Qwen3 reasoning is disabled for this tutor-serving test.
    if messages and messages[-1]["role"] == "user":
        messages[-1]["content"] += " /no_think"

    input_ids = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt",
    )

    prompt_tokens = input_ids.shape[1]

    # -----------------------------------------------------------------------
    # Generate
    # -----------------------------------------------------------------------

    with torch.no_grad():
        out = model.generate(
            input_ids,
            max_new_tokens=req.max_tokens,
            do_sample=req.temperature > 0,
            temperature=(
                req.temperature
                if req.temperature > 0
                else None
            ),
        )

    # -----------------------------------------------------------------------
    # Decode generated tokens
    # -----------------------------------------------------------------------

    new_tokens = out[0][prompt_tokens:]
    completion_tokens = len(new_tokens)

    text = tokenizer.decode(
        new_tokens,
        skip_special_tokens=True,
    )

    # Remove any Qwen reasoning tags if they appear.
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL,
    ).strip()

    # -----------------------------------------------------------------------
    # Finish reason
    # -----------------------------------------------------------------------

    finish_reason = (
        "length"
        if completion_tokens >= req.max_tokens
        else "stop"
    )

    # -----------------------------------------------------------------------
    # Return OpenAI-compatible response
    # -----------------------------------------------------------------------

    return ChatCompletionResponse(
        id="chatcmpl-" + uuid.uuid4().hex,
        created=int(time.time()),
        model=req.model,
        choices=[
            Choice(
                message=ResponseMessage(
                    role="assistant",
                    content=text,
                ),
                finish_reason=finish_reason,
            )
        ],
        usage=Usage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
        ),
    )


# ---------------------------------------------------------------------------
# Streaming is a DELTA STEP, not required for the green check.
# ---------------------------------------------------------------------------