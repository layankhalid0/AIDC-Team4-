import requests
import json
import time
import statistics
import csv
import os
from datetime import datetime


# ============================================================
# GPT CONFIGURATION
# ============================================================

MODEL_NAME = "gpt-5.6-terra"
MODEL_LABEL = "gpt-5.6-terra"

API_URL = "https://api.openai.com/v1/chat/completions"

# Read the API key from the environment.
# Do NOT put the API key directly in this file.
API_KEY = os.environ["OPENAI_API_KEY"]


# ============================================================
# BENCHMARK PARAMETERS
# ============================================================

# Same output limit used for Qwen and ALLAM.
MAX_TOKENS = 300


# ============================================================
# GPT-5.6 TERRA PRICING
# Per 1 million tokens
# ============================================================

INPUT_PRICE_PER_MILLION = 2.00
OUTPUT_PRICE_PER_MILLION = 12.00


# ============================================================
# SAME SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """You are an Arabic language coach.
Follow the user's instructions exactly.
Preserve the learner's intended meaning when correcting sentences.
Use the requested explanation language exactly.
Keep explanations short, simple, and factually accurate.
Do not add unrelated grammar rules."""


# ============================================================
# SAME DATASET
# ============================================================

DATASET_FILE = "dataset 2.csv"

DATASET = []

with open(DATASET_FILE, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    for row in reader:
        DATASET.append(row)


print(
    f"Loaded {len(DATASET)} test cases from {DATASET_FILE}"
)


# ============================================================
# REQUEST HEADERS
# ============================================================

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


# ============================================================
# RUN ONE GPT REQUEST
#
# Streaming is used so we can measure TTFT.
# ============================================================

def run_request(prompt):

    payload = {
        "model": MODEL_NAME,

        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        # Same output limit used for Qwen and ALLAM.
        "max_completion_tokens": MAX_TOKENS,

        "stream": True,

        "stream_options": {
            "include_usage": True
        }
    }


    # --------------------------------------------------------
    # Start timer
    # --------------------------------------------------------

    start_time = time.perf_counter()

    first_token_time = None

    response_parts = []

    usage = {}

    finish_reason = None


    # --------------------------------------------------------
    # Send request
    # --------------------------------------------------------

    response = requests.post(
        API_URL,
        headers=HEADERS,
        json=payload,
        stream=True,
        timeout=180
    )

    response.raise_for_status()


    # --------------------------------------------------------
    # Process streaming response
    # --------------------------------------------------------

    for line in response.iter_lines():

        if not line:
            continue

        line = line.decode("utf-8")

        if not line.startswith("data: "):
            continue

        data_text = line[6:]

        if data_text == "[DONE]":
            break

        try:
            chunk = json.loads(data_text)

        except json.JSONDecodeError:
            continue


        # ----------------------------------------------------
        # Usage is normally returned in the final stream chunk
        # ----------------------------------------------------

        if chunk.get("usage"):
            usage = chunk["usage"]


        choices = chunk.get(
            "choices",
            []
        )

        if not choices:
            continue


        choice = choices[0]

        delta = choice.get(
            "delta",
            {}
        )

        content = delta.get(
            "content"
        )


        # ----------------------------------------------------
        # First visible generated content = TTFT
        # ----------------------------------------------------

        if content:

            if first_token_time is None:
                first_token_time = time.perf_counter()

            response_parts.append(
                content
            )


        if choice.get("finish_reason"):
            finish_reason = choice["finish_reason"]


    # --------------------------------------------------------
    # Request completed
    # --------------------------------------------------------

    end_time = time.perf_counter()

    latency = (
        end_time
        - start_time
    )


    # --------------------------------------------------------
    # TTFT
    # --------------------------------------------------------

    if first_token_time is not None:

        ttft = (
            first_token_time
            - start_time
        )

    else:
        ttft = None


    # --------------------------------------------------------
    # TOKEN USAGE
    # --------------------------------------------------------

    prompt_tokens = usage.get(
        "prompt_tokens"
    )

    completion_tokens = usage.get(
        "completion_tokens"
    )

    total_tokens = usage.get(
        "total_tokens"
    )


    # --------------------------------------------------------
    # REASONING TOKENS
    #
    # Terra may include internal reasoning tokens inside
    # completion token usage.
    # --------------------------------------------------------

    completion_details = usage.get(
        "completion_tokens_details",
        {}
    )

    reasoning_tokens = completion_details.get(
        "reasoning_tokens",
        0
    )


    # --------------------------------------------------------
    # TPOT ESTIMATE
    #
    # Same client-side calculation used for Qwen / ALLAM.
    #
    # NOTE:
    # Terra completion_tokens may include reasoning tokens,
    # so this metric should be interpreted carefully when
    # comparing directly with open-weight models.
    # --------------------------------------------------------

    if (
        ttft is not None
        and completion_tokens is not None
        and completion_tokens > 1
    ):

        tpot = (
            latency - ttft
        ) / (
            completion_tokens - 1
        )

    else:
        tpot = None


    # --------------------------------------------------------
    # OUTPUT THROUGHPUT
    #
    # Uses API-reported completion tokens.
    # Terra completion tokens may include reasoning tokens.
    # --------------------------------------------------------

    if (
        completion_tokens is not None
        and latency > 0
    ):

        output_tokens_per_second = (
            completion_tokens
            / latency
        )

    else:
        output_tokens_per_second = None


    # --------------------------------------------------------
    # COST
    #
    # Cost uses the complete token usage reported by the API.
    # --------------------------------------------------------

    input_cost = (
        (prompt_tokens or 0)
        / 1_000_000
        * INPUT_PRICE_PER_MILLION
    )

    output_cost = (
        (completion_tokens or 0)
        / 1_000_000
        * OUTPUT_PRICE_PER_MILLION
    )

    request_cost = (
        input_cost
        + output_cost
    )


    # --------------------------------------------------------
    # RETURN REQUEST RESULT
    # --------------------------------------------------------

    return {

        "response":
            "".join(response_parts),

        "latency_seconds":
            round(
                latency,
                4
            ),

        "ttft_seconds":
            round(
                ttft,
                4
            )
            if ttft is not None
            else None,

        "tpot_seconds":
            round(
                tpot,
                4
            )
            if tpot is not None
            else None,

        "output_tokens_per_second":
            round(
                output_tokens_per_second,
                2
            )
            if output_tokens_per_second is not None
            else None,

        "prompt_tokens":
            prompt_tokens,

        "completion_tokens":
            completion_tokens,

        "reasoning_tokens":
            reasoning_tokens,

        "total_tokens":
            total_tokens,

        "input_cost_usd":
            round(
                input_cost,
                8
            ),

        "output_cost_usd":
            round(
                output_cost,
                8
            ),

        "request_cost_usd":
            round(
                request_cost,
                8
            ),

        "finish_reason":
            finish_reason
    }


# ============================================================
# RUN BENCHMARK
# ============================================================

results = []

benchmark_start = time.perf_counter()


for i, test_case in enumerate(
    DATASET,
    start=1
):

    prompt = test_case["Prompt"]


    print("\n================================")

    print(
        f"Running test case "
        f"{i}/{len(DATASET)}: "
        f"{test_case['ID']}"
    )

    print("================================")


    try:

        result = run_request(
            prompt
        )


        # ----------------------------------------------------
        # Keep dataset metadata
        # ----------------------------------------------------

        result["id"] = (
            test_case["ID"]
        )

        result["level"] = (
            test_case["Level"]
        )

        result["category"] = (
            test_case["Category"]
        )

        result["language"] = (
            test_case["Language"]
        )

        result["prompt"] = (
            prompt
        )

        result["expected_behavior"] = (
            test_case[
                "Expected_Behavior"
            ]
        )

        result["what_we_test"] = (
            test_case[
                "What_We_Test"
            ]
        )


        results.append(
            result
        )


        # ----------------------------------------------------
        # Print request metrics
        # ----------------------------------------------------

        print(
            "Latency:",
            result["latency_seconds"],
            "s"
        )

        print(
            "TTFT:",
            result["ttft_seconds"],
            "s"
        )

        print(
            "TPOT:",
            result["tpot_seconds"],
            "s/token"
        )

        print(
            "Output throughput:",
            result[
                "output_tokens_per_second"
            ],
            "tokens/s"
        )

        print(
            "Prompt tokens:",
            result["prompt_tokens"]
        )

        print(
            "Completion tokens:",
            result["completion_tokens"]
        )

        print(
            "Reasoning tokens:",
            result["reasoning_tokens"]
        )

        print(
            "Request cost: $",
            result["request_cost_usd"]
        )


    except Exception as e:

        print(
            "ERROR:",
            e
        )


        results.append({

            "id":
                test_case["ID"],

            "level":
                test_case["Level"],

            "category":
                test_case["Category"],

            "language":
                test_case["Language"],

            "prompt":
                prompt,

            "expected_behavior":
                test_case[
                    "Expected_Behavior"
                ],

            "what_we_test":
                test_case[
                    "What_We_Test"
                ],

            "error":
                str(e)
        })


benchmark_end = time.perf_counter()


# ============================================================
# SUMMARY FUNCTIONS
# ============================================================

def get_values(key):

    return [
        result[key]

        for result in results

        if result.get(key)
        is not None
    ]


def average(values):

    if not values:
        return None

    return round(
        statistics.mean(values),
        4
    )


def percentile(
    values,
    percentile_value
):

    if not values:
        return None


    sorted_values = sorted(
        values
    )


    index = int(
        (len(sorted_values) - 1)
        * percentile_value
    )


    return round(
        sorted_values[index],
        4
    )


# ============================================================
# COLLECT VALUES
# ============================================================

latencies = get_values(
    "latency_seconds"
)

ttfts = get_values(
    "ttft_seconds"
)

tpots = get_values(
    "tpot_seconds"
)

throughputs = get_values(
    "output_tokens_per_second"
)


successful_requests = sum(
    1

    for result in results

    if "error" not in result
)


failed_requests = (
    len(DATASET)
    - successful_requests
)


success_rate = (
    successful_requests
    / len(DATASET)
    * 100
)


total_time = (
    benchmark_end
    - benchmark_start
)


# ============================================================
# TOKEN TOTALS
# ============================================================

total_prompt_tokens = sum(
    result.get(
        "prompt_tokens"
    ) or 0

    for result in results
)


total_completion_tokens = sum(
    result.get(
        "completion_tokens"
    ) or 0

    for result in results
)


total_reasoning_tokens = sum(
    result.get(
        "reasoning_tokens"
    ) or 0

    for result in results
)


total_tokens = sum(
    result.get(
        "total_tokens"
    ) or 0

    for result in results
)


# ============================================================
# COST TOTALS
# ============================================================

total_input_cost = sum(
    result.get(
        "input_cost_usd"
    ) or 0

    for result in results
)


total_output_cost = sum(
    result.get(
        "output_cost_usd"
    ) or 0

    for result in results
)


total_cost = (
    total_input_cost
    + total_output_cost
)


# ============================================================
# OVERALL THROUGHPUT
# ============================================================

if total_time > 0:

    requests_per_second = (
        successful_requests
        / total_time
    )


    overall_output_tokens_per_second = (
        total_completion_tokens
        / total_time
    )

else:

    requests_per_second = 0

    overall_output_tokens_per_second = 0


# ============================================================
# FINAL SUMMARY
# ============================================================

summary = {

    "total_requests":
        len(DATASET),

    "successful_requests":
        successful_requests,

    "failed_requests":
        failed_requests,

    "success_rate_percent":
        round(
            success_rate,
            2
        ),

    "total_benchmark_time_seconds":
        round(
            total_time,
            4
        ),


    # Latency

    "average_latency_seconds":
        average(
            latencies
        ),

    "p95_latency_seconds":
        percentile(
            latencies,
            0.95
        ),


    # TTFT

    "average_ttft_seconds":
        average(
            ttfts
        ),

    "p95_ttft_seconds":
        percentile(
            ttfts,
            0.95
        ),


    # TPOT

    "average_tpot_seconds":
        average(
            tpots
        ),

    "p95_tpot_seconds":
        percentile(
            tpots,
            0.95
        ),


    # Throughput

    "average_output_tokens_per_second":
        average(
            throughputs
        ),

    "overall_output_tokens_per_second":
        round(
            overall_output_tokens_per_second,
            2
        ),

    "requests_per_second":
        round(
            requests_per_second,
            4
        ),


    # Tokens

    "total_prompt_tokens":
        total_prompt_tokens,

    "total_completion_tokens":
        total_completion_tokens,

    "total_reasoning_tokens":
        total_reasoning_tokens,

    "total_tokens":
        total_tokens,


    # Cost

    "total_input_cost_usd":
        round(
            total_input_cost,
            6
        ),

    "total_output_cost_usd":
        round(
            total_output_cost,
            6
        ),

    "total_cost_usd":
        round(
            total_cost,
            6
        )
}


# ============================================================
# SAVE JSON
# ============================================================

output = {

    "model":
        MODEL_NAME,

    "model_label":
        MODEL_LABEL,

    # Terra rejected temperature=0.2.
    # The model default is used instead.
    "temperature":
        "default",

    "temperature_note":
        "Custom temperature=0.2 is unsupported by this model.",

    "max_completion_tokens":
        MAX_TOKENS,

    "system_prompt":
        SYSTEM_PROMPT,

    "dataset_file":
        DATASET_FILE,

    "pricing_usd_per_1m_tokens": {

        "input":
            INPUT_PRICE_PER_MILLION,

        "output":
            OUTPUT_PRICE_PER_MILLION
    },

    "metric_note":
        (
            "GPT completion_tokens may include reasoning tokens. "
            "TPOT and output throughput use API-reported completion_tokens "
            "and should be interpreted carefully when comparing with "
            "Qwen and ALLAM."
        ),

    "timestamp":
        datetime.now().isoformat(),

    "summary":
        summary,

    "results":
        results
}


filename = (
    f"benchmark_{MODEL_LABEL}.json"
)


with open(
    filename,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        ensure_ascii=False,
        indent=2
    )


# ============================================================
# PRINT FINAL REPORT
# ============================================================

print("\n")
print("================================")
print("BENCHMARK COMPLETED")
print("================================")

print(
    "Model:",
    MODEL_NAME
)

print(
    "Successful requests:",
    successful_requests,
    "/",
    len(DATASET)
)

print(
    "Success rate:",
    summary[
        "success_rate_percent"
    ],
    "%"
)


print("\n--- LATENCY ---")

print(
    "Average:",
    summary[
        "average_latency_seconds"
    ],
    "s"
)

print(
    "P95:",
    summary[
        "p95_latency_seconds"
    ],
    "s"
)


print("\n--- TTFT ---")

print(
    "Average:",
    summary[
        "average_ttft_seconds"
    ],
    "s"
)

print(
    "P95:",
    summary[
        "p95_ttft_seconds"
    ],
    "s"
)


print("\n--- TPOT ---")

print(
    "Average:",
    summary[
        "average_tpot_seconds"
    ],
    "s/token"
)

print(
    "P95:",
    summary[
        "p95_tpot_seconds"
    ],
    "s/token"
)


print("\n--- THROUGHPUT ---")

print(
    "Average output:",
    summary[
        "average_output_tokens_per_second"
    ],
    "tokens/s"
)

print(
    "Overall output:",
    summary[
        "overall_output_tokens_per_second"
    ],
    "tokens/s"
)

print(
    "Requests/sec:",
    summary[
        "requests_per_second"
    ]
)


print("\n--- TOKENS ---")

print(
    "Prompt tokens:",
    summary[
        "total_prompt_tokens"
    ]
)

print(
    "Completion tokens:",
    summary[
        "total_completion_tokens"
    ]
)

print(
    "Reasoning tokens:",
    summary[
        "total_reasoning_tokens"
    ]
)

print(
    "Total tokens:",
    summary[
        "total_tokens"
    ]
)


print("\n--- COST ---")

print(
    "Input cost: $",
    summary[
        "total_input_cost_usd"
    ]
)

print(
    "Output cost: $",
    summary[
        "total_output_cost_usd"
    ]
)

print(
    "Total cost: $",
    summary[
        "total_cost_usd"
    ]
)


print(
    "\nSaved to:",
    filename
)

print("================================")