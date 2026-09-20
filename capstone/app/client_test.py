"""Prove the contract with the real openai client, not curl.

The whole point of building the OpenAI-compatible shape is that a standard
client works against it with only a base_url swap. Start the server first:

    uvicorn main:app --host 0.0.0.0 --port 8000

then in another shell:

    python client_test.py

It sends one chat completion and prints the reply. If this prints a coherent
answer, your /v1/chat/completions route honours the contract.
"""
from openai import OpenAI

# base_url swap: point the client at the local service instead of api.openai.com.
# The api_key is required by the client but unused by our server this week.
client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")

resp = client.chat.completions.create(
    model="Qwen/Qwen3-8B",
    messages=[
        {"role": "system", "content": "You are a terse assistant."},
        {"role": "user", "content": "Name three primary colours."},
    ],
    max_tokens=64,
)

print("reply:", resp.choices[0].message.content)
print("finish_reason:", resp.choices[0].finish_reason)
print("usage:", resp.usage)
# Working requests for each route

Start the server first:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then run these from another shell. Each shows a working curl and the shape of
the expected output. Build the routes until each one answers as shown.

## GET /health (done for you)

```bash
curl -s http://localhost:8000/health
```

Expected shape:

```json
{"status": "ok", "model": "Qwen/Qwen2.5-0.5B-Instruct"}
```

This is the first win: it works the moment the model loads, before you write any
other route.

## GET /v1/models

```bash
curl -s http://localhost:8000/v1/models
```

Expected shape (one model this week):

```json
{
  "object": "list",
  "data": [
    {"id": "Qwen/Qwen2.5-0.5B-Instruct", "object": "model", "created": 1756000000, "owned_by": "aidc"}
  ]
}
```

The `id` must equal the served model id. `created` is any unix timestamp.

## POST /v1/chat/completions (non-streaming)

```bash
curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-0.5B-Instruct",
    "messages": [{"role": "user", "content": "Say hello in one word."}],
    "max_tokens": 16
  }'
```

Expected shape (content and numbers vary):

```json
{
  "id": "chatcmpl-8f3a...",
  "object": "chat.completion",
  "created": 1756000000,
  "model": "Qwen/Qwen2.5-0.5B-Instruct",
  "choices": [
    {"index": 0,
     "message": {"role": "assistant", "content": "Hello."},
     "finish_reason": "stop"}
  ],
  "usage": {"prompt_tokens": 12, "completion_tokens": 2, "total_tokens": 14}
}
```

Checks that must hold: `choices[0].message.content` is non-empty; `usage`
counts are all positive and `total_tokens == prompt_tokens + completion_tokens`;
`model` echoes what you sent.

## POST /v1/chat/completions with streaming (delta step, optional)

```bash
curl -sN http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-0.5B-Instruct",
    "messages": [{"role": "user", "content": "Count to five."}],
    "max_tokens": 32,
    "stream": true
  }'
```

Expected: a sequence of Server-Sent Events, each line beginning `data: `, each
carrying a chunk with `choices[0].delta.content`, and the stream ending with the
literal line:

```
data: [DONE]
```

The `-N` flag disables curl buffering so you see the chunks arrive one at a time.
