# Evaluation Documentation

## 1. Overview

The **Arabic Language Coach (ALC)** project includes a structured evaluation process to assess language-model behavior and inference performance for Arabic and English language-learning tasks.

The evaluation process consists of two complementary components:

1. **Language Quality Evaluation**
   - Evaluates model responses to language-learning prompts.
   - Focuses on grammar correction, translation, explanation, conversation, roleplay, coaching, vocabulary, and context preservation.

2. **Performance Benchmarking**
   - Evaluates serving and inference performance under a controlled workload.
   - Measures latency, throughput, token generation performance, request success, and related inference metrics.

Keeping these two components separate allows language quality and infrastructure performance to be analyzed independently.

---

## 2. Evaluation Dataset

The evaluation dataset is stored in:

`dataset 2.csv`

The dataset contains project-specific prompts designed for the Arabic Language Coach use case.

### Dataset Structure

| Field | Description |
|---|---|
| `ID` | Unique identifier for each evaluation prompt |
| `Level` | Learner proficiency level |
| `Category` | Type of language-learning task |
| `Language` | Language or language combination used in the prompt |
| `Prompt` | Input provided to the model |
| `Expected_Behavior` | Expected behavior of the model |
| `What_We_Test` | Specific capability being evaluated |

### Learner Levels

The dataset covers multiple learner proficiency levels:

- A1
- A2
- A3

### Evaluation Categories

The dataset includes the following task categories:

- Conversation
- Roleplay
- Coaching
- Vocabulary
- Explanation

### Language Coverage

The dataset covers:

- Arabic (`AR`)
- Arabic dialect (`AR_Dialect`)
- English (`EN`)
- Mixed Arabic and English (`MIX`)

This provides coverage of Arabic and English language-learning scenarios, including code-switching and dialect-related prompts.

---

## 3. Evaluation Methodology

The evaluation uses project-specific prompts representing realistic interactions that may occur in an Arabic language-learning application.

Each model receives evaluation prompts and produces a response that is stored together with execution metadata.

The evaluation records include:

- Prompt identifier
- Prompt text
- Model response
- Prompt token count
- Completion token count
- Total token count
- Response latency
- Finish reason

The evaluation is designed to observe whether the model:

- Follows the requested task
- Preserves the learner's intended meaning
- Provides appropriate corrections
- Responds in the requested language
- Provides concise and factually accurate explanations

---

## 4. Evaluation System Prompt

The language models were evaluated using the following Arabic Language Coach system behavior:

```text
You are an Arabic language coach.

Follow the user's instructions exactly.

Preserve the learner's intended meaning when correcting sentences.

Use the requested explanation language exactly.

Keep explanations short, simple, and factually accurate.

Do not add unrelated grammar rules.
```

## 5. Model Evaluation

### 5.1 Qwen3-8B-AWQ

**Model:** `Qwen/Qwen3-8B-AWQ`

The Qwen3-8B-AWQ model was evaluated using the following evaluation artifacts:

- `eval10_qwen3-8b-awq.json`
- `eval20_qwen3-8b-awq.json`

These files contain the raw model responses together with the execution metadata generated during the evaluation process.

### 5.2 ALLaM-7B

**Model:** `ALLaM-7B`

The ALLaM-7B model was evaluated using the following evaluation artifacts:

- `eval10_allam-7b.json`
- `eval20_allam-7b.json`

These files contain the raw model responses and execution metadata for the evaluated prompts.

### 5.3 Mistral-Nemo-AWQ

**Model:** `casperhansen/mistral-nemo-instruct-2407-awq`

The Mistral-Nemo-AWQ evaluation used the following configuration:

- Temperature: `0.2`
- Maximum output tokens: `300`
- Evaluation artifact: `eval10_mistral-nemo-awq.json`

The stored evaluation fields include:

- Prompt ID
- Prompt
- Response
- Latency
- Prompt tokens
- Completion tokens
- Total tokens
- Finish reason

During evaluation, an Arabic grammar-correction prompt resulted in a response in English and was interpreted as an English grammar task rather than an Arabic correction task.

This observation is relevant because the system prompt explicitly requires the model to use the requested explanation language.

### 5.4 GPT-5.6-terra

**Model:** `gpt-5.6-terra`

The GPT-5.6-terra evaluation used the following configuration:

- Temperature: `1.0`
- Maximum output tokens: Not specified in the result file
- Evaluation artifact: `gpt-5.6-terra-evaluation-results.json`

The stored evaluation fields include:

- Test ID
- Prompt
- Response
- Latency
- Prompt tokens
- Completion tokens
- Temperature
- Status code
- Finish reason

Example evaluation input:

`أنا يذهب إلى الجامعة كل يوم.`

The model corrected the sentence to:

`أنا أذهب إلى الجامعة كل يوم.`

The response also provided a concise Arabic explanation related to first-person pronoun and verb agreement.

## 6. Evaluation Artifacts

The evaluation artifacts preserve the raw model responses and execution metadata generated during testing.

| Model | Evaluation Artifacts |
|---|---|
| Qwen3-8B-AWQ | `eval10_qwen3-8b-awq.json`, `eval20_qwen3-8b-awq.json` |
| ALLaM-7B | `eval10_allam-7b.json`, `eval20_allam-7b.json` |
| Mistral-Nemo-AWQ | `eval10_mistral-nemo-awq.json` |
| GPT-5.6-terra | `gpt-5.6-terra-evaluation-results.json` |

These JSON files provide traceable records of the model outputs and the runtime information associated with each evaluation.

## 7. Performance Benchmark

Performance benchmarking was used to evaluate inference and serving behavior under a controlled workload.

The benchmark artifacts are:

- `benchmark_qwen3-8b-awq.json`
- `benchmark_allam-7b.json`
- `benchmark_gpt-5.6-terra.json`

The benchmarks use `dataset 2.csv` as the evaluation workload.

### 7.1 Benchmark Metrics

The benchmark records the following metrics:

#### Request Success

- Total requests
- Successful requests
- Failed requests
- Success rate

#### Latency

- Average latency
- P95 latency

#### Token Generation

- Average TTFT (Time to First Token)
- P95 TTFT
- Average TPOT (Time Per Output Token)
- P95 TPOT

#### Throughput

- Average output tokens per second
- Overall output tokens per second
- Requests per second (RPS)

#### Token Usage

- Prompt tokens
- Completion tokens
- Total tokens

Additional provider-specific metrics may also be recorded when available.

---

## 8. Benchmark Results

### Qwen3-8B-AWQ

| Metric | Result |
|---|---:|
| Success Rate | 100% |
| Average Latency | 1.4244 s |
| P95 Latency | 2.6847 s |
| Average TTFT | 0.0249 s |
| P95 TTFT | 0.0275 s |
| Average TPOT | 0.0089 s |
| P95 TPOT | 0.0089 s |
| Average Output Throughput | 110.8428 tokens/s |
| Overall Output Throughput | 111.27 tokens/s |
| RPS | 0.702 |

### ALLaM-7B

| Metric | Result |
|---|---:|
| Success Rate | 100% |
| Average Latency | 1.6371 s |
| P95 Latency | 4.2304 s |
| Average TTFT | 0.0477 s |
| P95 TTFT | 0.0451 s |
| Average TPOT | 0.0207 s |
| P95 TPOT | 0.0208 s |
| Average Output Throughput | 47.084 tokens/s |
| Overall Output Throughput | 47.43 tokens/s |
| RPS | 0.6108 |

### GPT-5.6-terra

| Metric | Result |
|---|---:|
| Success Rate | 100% |
| Average Latency | 3.552 s |
| P95 Latency | 6.3609 s |
| Average TTFT | 1.5108 s |
| P95 TTFT | 2.4965 s |
| Average TPOT | 0.0131 s |
| P95 TPOT | 0.0209 s |
| Average Output Throughput | 42.0236 tokens/s |
| Overall Output Throughput | 43.05 tokens/s |
| RPS | 0.2815 |

### GPT-5.6-terra Token and Cost Metrics

| Metric | Result |
|---|---:|
| Prompt Tokens | 7,254 |
| Completion Tokens | 15,294 |
| Reasoning Tokens | 4,256 |
| Total Tokens | 22,548 |
| Input Cost | $0.014508 |
| Output Cost | $0.183528 |
| Total Cost | $0.198036 |

The GPT benchmark also records token usage and provider-specific cost information to provide additional context for API-based inference.
## 9. GPT Benchmark Considerations

The GPT benchmark configuration differs from the open-model benchmarks in several aspects.

- The benchmark uses the default temperature because the evaluated GPT model does not support the custom temperature value of `0.2` used for some open-model evaluations.
- Completion token counts may include reasoning tokens.
- TPOT should therefore be interpreted carefully when comparing GPT results with open-model results.
- Output-token throughput is not perfectly equivalent across different providers and serving configurations.
- Token usage and cost are provider-specific metrics.

These differences should be considered when interpreting cross-model benchmark results.

---

## 10. Benchmark Interpretation

The performance benchmark measures controlled inference and serving behavior.

The benchmark metrics describe infrastructure and generation performance rather than language quality.

A model may differ from another model in several independent dimensions, including:

- Language correctness
- Instruction following
- Arabic language behavior
- Response quality
- Latency
- Throughput
- Token efficiency
- Cost

For this reason, language evaluation results and performance benchmark results are kept as separate evaluation dimensions.

---

## 11. Evaluation Scripts

The evaluation workflow uses the following scripts:

- `eval_10.py`
- `eval_10_qwen.py`
- `eval_10_mistral.py`
- `eval_20_qwen.py`
- `eval_20_allam.py`
- `benchmark_open_model.py`
- `benchmark_gpt.py`
- `human_review.py`

The evaluation scripts are responsible for running model prompts, collecting responses, recording execution metadata, and generating evaluation or benchmark artifacts.

---

## 12. Human Review

Human review is provided as a complementary evaluation method because latency, throughput, and token metrics cannot fully represent language quality.

The human review process considers factors such as:

- Grammatical correctness
- Meaning preservation
- Naturalness of the response
- Instruction following
- Explanation quality
- Use of the requested response language
- Appropriateness for the learner's level

The human review results complement the automated evaluation and performance benchmark results by providing qualitative assessment of the model responses.

## 13. Evaluation Output Files

The following files are generated or used as part of the evaluation workflow:

- `dataset 2.csv`
- `eval10_qwen3-8b-awq.json`
- `eval20_qwen3-8b-awq.json`
- `eval10_allam-7b.json`
- `eval20_allam-7b.json`
- `eval10_mistral-nemo-awq.json`
- `gpt-5.6-terra-evaluation-results.json`
- `benchmark_qwen3-8b-awq.json`
- `benchmark_allam-7b.json`
- `benchmark_gpt-5.6-terra.json`
- `benchmark_open_model.py`
- `benchmark_gpt.py`
- `human_review.py`
- `model_comparison_results.html`

The raw JSON evaluation files preserve model responses and execution metadata, providing traceable evidence for the evaluation results.

---

## 14. Model Comparison

The model comparison is organized into two independent dimensions:

### Language Evaluation

Language evaluation focuses on response quality and model behavior, including:

- Grammar correction
- Translation
- Explanation
- Conversation
- Roleplay
- Coaching
- Vocabulary
- Arabic dialect handling
- English language tasks
- Mixed-language tasks
- Instruction following
- Meaning preservation

### Performance Benchmark

Performance benchmarking focuses on inference and serving characteristics, including:

- Request success
- Latency
- TTFT
- TPOT
- Throughput
- Requests per second
- Token usage
- Cost

No single metric provides a complete measure of model suitability. The language-quality evaluation and performance benchmark should therefore be considered together while remaining separate in their measurement objectives.

---

## 15. Reproducibility

The evaluation workflow preserves the main artifacts required to reproduce the evaluation process, including:

- Evaluation dataset
- Evaluation scripts
- Model configurations
- Benchmark scripts
- Evaluation outputs
- Benchmark outputs

The general workflow is:

1. Prepare the evaluation dataset.
2. Configure the model.
3. Run the evaluation script.
4. Store model responses and execution metadata.
5. Run the performance benchmark when applicable.
6. Perform automated and human review.
7. Compare language quality and inference performance separately.
8. Preserve the generated JSON artifacts.

The JSON evaluation files provide a record of the model responses and runtime information used during the evaluation.

---

## 16. Evaluation Limitations

The evaluation has several limitations that should be considered when interpreting the results:

- The dataset is project-specific and does not cover every possible language-learning scenario.
- The evaluation uses selected prompt categories and language scenarios.
- Different evaluation runs may use different prompt sets.
- The project does not use a large-scale standardized human-scored benchmark.
- Human review is used as a complementary qualitative evaluation method.
- Performance results depend on the hardware and runtime environment.
- Provider differences exist between the GPT API and locally deployed open models.
- Arabic language coverage does not represent every Arabic dialect or conversational context.

These limitations mean that the results should be interpreted within the scope of the project methodology and evaluation environment.

---

## 17. Summary

The Arabic Language Coach project uses a structured evaluation workflow combining language-quality evaluation with inference-performance benchmarking.

The evaluated models include:

- Qwen3-8B-AWQ
- ALLaM-7B
- Mistral-Nemo-AWQ
- GPT-5.6-terra

Language evaluation artifacts preserve model responses and execution metadata, while benchmark artifacts measure serving and inference characteristics such as latency, throughput, token generation, request success, and token usage.

The evaluation results are project-specific and should be interpreted together with the evaluation methodology, model configuration, benchmark environment, and documented limitations.