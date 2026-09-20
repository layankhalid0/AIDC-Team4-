# Qwen3-8B Evaluation Results

## Model Setup

- **Model:** Qwen/Qwen3-8B
- **Serving Framework:** vLLM
- **GPU:** NVIDIA RTX A6000 48GB
- **Max Context Length:** 4096
- **API Endpoint:** `/v1/chat/completions`
- **Temperature:** 0.2
- **Reasoning Mode:** `/no_think`
- **Max Output Tokens:** 512

---

# Test 1 — Basic English Grammar Correction

## Level

Basic

## Task

Correct the learner’s English sentence, explain the error in Arabic, and provide two correct examples.

## Input

> Yesterday I go to the market.

## Expected Correction

> Yesterday I went to the market.

## Result

The model correctly changed **go** to **went**, explained the error in Arabic, and provided two correct examples.

## Assessment

- English correction: ✅
- Error explanation in Arabic: ✅
- Examples: ✅
- Response completed: ✅

## Metrics

- **Finish reason:** `stop`
- **Prompt tokens:** 56
- **Completion tokens:** 338
- **Total tokens:** 394

## Notes

The model successfully handled a basic English grammar correction with an Arabic explanation.

---

# Test 2 — Arabic/English Code-Switching

## Level

Intermediate

## Task

Correct the English errors in a mixed Arabic/English sentence and explain the corrections in Arabic.

## Input

> Yesterday I was going to الجامعة, but I forget my book at home.

## Expected Corrections

- **الجامعة → the university**
- **forget → forgot**

## Result

The model correctly produced:

> Yesterday I was going to the university, but I forgot my book at home.

It identified and explained both corrections.

## Assessment

- Code-switching understanding: ✅
- Error detection: ✅
- Correction accuracy: ✅
- Arabic explanation: ⚠️
- Response completion: ⚠️

## Issues Observed

The Arabic explanation contained an unexpected Chinese character:

> م冠

The captured response also appeared incomplete.

## Metrics

- **Finish reason:** Not recorded
- **Prompt tokens:** Not recorded
- **Completion tokens:** Not recorded
- **Total tokens:** Not recorded

## Notes

The model successfully understood the mixed Arabic/English input and corrected the English errors. However, the Arabic explanation showed a language-quality issue, and the captured response appeared incomplete.

---

# Test 3 — Natural Bilingual Tutoring

## Level

Advanced

## Task

Act as an English tutor in a natural Arabic/English conversation.

The model should:

1. Understand the mixed-language message.
2. Identify English mistakes.
3. Explain the corrections in Arabic.
4. Respond naturally as a tutor.
5. Provide helpful and encouraging advice.
6. Avoid translating the entire message into English.

## Input

> أنا اليوم كنت في الجامعة and I had a presentation. بصراحة I was very nervous because I did not practice enough. بعدين my friend told me to relax, but I still make many mistakes while I was speaking. What do you think I should do next time?

## Result

The model:

- Understood the Arabic/English message.
- Identified the **make → made** correction.
- Provided Arabic explanations.
- Provided advice for future presentations.
- Maintained an encouraging tone.

However, it also treated the use of Arabic/English code-switching itself as a problem and suggested using only one language.

The response also reached the token limit before completing the answer.

## Assessment

- Bilingual understanding: ✅
- English error detection: ✅
- Correction accuracy: ✅
- Arabic explanation: ✅
- Natural tutor behavior: ⚠️
- Code-switching handling: ⚠️
- Encouraging tone: ✅
- Response completion: ❌

## Metrics

- **Finish reason:** `length`
- **Prompt tokens:** 103
- **Completion tokens:** 512
- **Total tokens:** 615

## Notes

The model demonstrated good bilingual understanding and English correction ability. However, it incorrectly treated natural Arabic/English code-switching as an error, and the response was truncated because it reached the maximum output token limit.

---

# Initial Qwen3-8B Results Summary

| Test | Level | Result |
|---|---|---|
| Test 1 | Basic | ✅ |
| Test 2 | Intermediate | ⚠️ |
| Test 3 | Advanced | ⚠️ |

## Strengths

- Good basic English grammar correction.
- Able to understand Arabic/English mixed input.
- Able to explain English corrections in Arabic.
- Can provide encouraging tutor-style feedback.

## Issues Observed

- Arabic output quality issue observed in Test 2.
- Natural code-switching was not always handled as expected.
- Longer responses may reach the output token limit.
- Test 3 was truncated before completion.