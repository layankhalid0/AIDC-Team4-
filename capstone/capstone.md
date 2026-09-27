# Arabic Language Coach

## Overview

**Arabic Language Coach** is an AI-powered language learning application designed to provide conversational practice, sentence correction, and clear language feedback for Arabic learners.

The project focuses on building a reliable and efficient **LLM serving infrastructure**, including model evaluation, benchmarking, optimization, containerization, Kubernetes deployment, monitoring, and tool calling.

The final deployed model is:

**Qwen/Qwen3-8B-AWQ**

It is served using **vLLM** on Kubernetes and exposed through an **OpenAI-compatible API**.

---

## Architecture

```text
User
  │
  ▼
Chat UI
  │
  ▼
OpenAI-Compatible API
  │
  ▼
Kubernetes Service
  │
  ▼
vLLM Model Server
  │
  ▼
Qwen3-8B-AWQ
  │
  ▼
NVIDIA GPU
```

Monitoring:

```text
vLLM Metrics
     │
     ▼
Prometheus
     │
     ▼
Grafana
```

---

## Model Evaluation

Multiple open-weight language models were evaluated to identify a suitable model for the Arabic Language Coach.

The main evaluated models included:

- **Qwen3-8B-AWQ**
- **ALLaM-7B-Instruct-preview**

The evaluation considered:

- Arabic language quality
- Instruction following
- Response latency
- Time to First Token (TTFT)
- Time per Output Token (TPOT)
- Throughput
- GPU memory usage
- Deployment compatibility

---

## Benchmark Results

### Qwen3-8B-AWQ

| Metric | Result |
|---|---:|
| Successful Requests | 100 / 100 |
| Success Rate | 100% |
| Average Latency | 1.4244 s |
| P95 Latency | 2.6847 s |
| Average TTFT | 0.0249 s |
| P95 TTFT | 0.0275 s |
| Average TPOT | 0.0089 s/token |
| Average Output Throughput | 110.84 tokens/s |
| Overall Output Throughput | 111.27 tokens/s |
| Requests/sec | 0.702 |
| Total Tokens | 24,023 |
| GPU Memory | ~14.54 GiB |

### ALLaM-7B-Instruct-preview

| Metric | Result |
|---|---:|
| Successful Requests | 100 / 100 |
| Success Rate | 100% |
| Average Latency | 1.6371 s |
| P95 Latency | 4.2304 s |
| Average TTFT | 0.0477 s |
| P95 TTFT | 0.0451 s |
| Average TPOT | 0.0207 s/token |
| Average Output Throughput | 47.08 tokens/s |
| Overall Output Throughput | 47.43 tokens/s |
| Requests/sec | 0.6108 |
| Total Tokens | 17,028 |
| GPU Memory | ~40.68 GiB |

---

## Final Model

**Qwen3-8B-AWQ** was selected for the final deployment.

The deployed model provides:

- Arabic and bilingual support
- 100% request success rate in the benchmark
- Low Time to First Token
- High token throughput
- AWQ quantization
- GPU memory usage below the 16 GB target
- OpenAI-compatible API
- Automatic tool calling

---

## Model Serving

The model is served using **vLLM**.

```text
Model: Qwen/Qwen3-8B-AWQ
Serving Engine: vLLM
vLLM Version: 0.27.1
Max Model Length: 4096
GPU Memory Utilization: 0.30
API Format: OpenAI-compatible
Tool Calling: Enabled
Tool Parser: Hermes
```

Serving configuration:

```bash
vllm serve Qwen/Qwen3-8B-AWQ \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 4096 \
  --gpu-memory-utilization 0.30 \
  --enable-auto-tool-choice \
  --tool-call-parser hermes
```

---

## Docker

The model server is containerized using Docker.

Final image:

```text
aidcteam4/capstone-qwen3-8b-awq:v4
```

Base image:

```text
vllm/vllm-openai:v0.27.1
```

The container starts the model through vLLM and exposes the API on port `8000`.

---

## Kubernetes Deployment

The application is deployed on Kubernetes and managed using Helm.

```text
Namespace: team
Helm Release: capstone-qwen
Deployment: capstone-qwen-serving
Service: capstone-qwen-serving
Container: qwen
Service Type: NodePort
NodePort: 30800
```

Deployment flow:

```text
Docker Image
     │
     ▼
Helm
     │
     ▼
Kubernetes Deployment
     │
     ▼
Qwen Pod
     │
     ▼
Kubernetes Service
     │
     ▼
External Endpoint
```

---

## OpenAI-Compatible API

The model is exposed through an OpenAI-compatible API, making it easier to integrate with existing applications and AI frameworks.

Available endpoints include:

```text
GET  /health
GET  /v1/models
POST /v1/chat/completions
GET  /metrics
```

Example request:

```bash
curl /v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-8B-AWQ",
    "messages": [
      {
        "role": "user",
        "content": "Correct this Arabic sentence and explain the mistake."
      }
    ],
    "max_tokens": 300,
    "chat_template_kwargs": {
      "enable_thinking": false
    }
  }'
```

---

## Tool Calling

The deployed model supports **OpenAI-compatible automatic tool calling**.

Tool calling is enabled using:

```text
--enable-auto-tool-choice
--tool-call-parser hermes
```

The model can determine when an external tool is required and return a structured tool call:

```json
{
  "tool_calls": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"Riyadh\"}"
      }
    }
  ]
}
```

The complete tool-calling flow was tested successfully:

```text
User Request
     │
     ▼
Qwen3-8B-AWQ
     │
     ▼
Structured Tool Call
     │
     ▼
Backend Executes Tool
     │
     ▼
Tool Result
     │
     ▼
Qwen3-8B-AWQ
     │
     ▼
Final Response
```

---

## Language Coach Behavior

The model uses a system prompt designed for language coaching:

```text
You are an Arabic language coach.
Follow the user's instructions exactly.
Preserve the learner's intended meaning when correcting sentences.
Use the requested explanation language exactly.
Keep explanations short, simple, and factually accurate.
Do not add unrelated grammar rules.
```

This helps keep responses focused on correction, explanation, and conversational language learning.

---

## Monitoring

The model server exposes vLLM metrics through:

```text
/metrics
```

The monitoring stack uses:

- **Prometheus** for metrics collection
- **Grafana** for visualization
- **vLLM metrics** for model-serving observability

Architecture:

```text
Qwen3-8B-AWQ
      │
      ▼
    vLLM
      │
      │ /metrics
      ▼
 Prometheus
      │
      ▼
   Grafana
```

---

## Technology Stack

| Area | Technology |
|---|---|
| LLM | Qwen3-8B-AWQ |
| Model Serving | vLLM |
| Quantization | AWQ |
| API | OpenAI-compatible API |
| Containerization | Docker |
| Orchestration | Kubernetes / k3s |
| Deployment | Helm |
| GPU | NVIDIA RTX A6000 |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Benchmarking | Python |

---

## Project Workflow

```text
Model Research
      ↓
Model Shortlisting
      ↓
Evaluation Dataset
      ↓
Model Evaluation
      ↓
Prompt Engineering
      ↓
Infrastructure Benchmarking
      ↓
Model Selection
      ↓
Optimization
      ↓
Dockerization
      ↓
vLLM Serving
      ↓
Kubernetes Deployment
      ↓
OpenAI-Compatible API
      ↓
Tool Calling
      ↓
Monitoring
      ↓
UI Integration
```

---

## Project Goal

The goal of the project is to demonstrate an end-to-end AI model-serving workflow for an Arabic language learning application, from **model evaluation and benchmarking** to **GPU deployment, API serving, observability, and application integration**.