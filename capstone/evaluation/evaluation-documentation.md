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

