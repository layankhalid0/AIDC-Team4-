import os
import json
import time
import requests
from datetime import datetime

API_KEY = os.environ["OPENAI_API_KEY"]

MODEL = "gpt-5.6-terra"
URL = "https://api.openai.com/v1/responses"

# GPT-5.6-terra does not support setting temperature.
# The API uses its default temperature, observed as 1.0.
TEMPERATURE = 1.0

SYSTEM_PROMPT = """You are an Arabic language coach.
Follow the user's instructions exactly.
Preserve the learner's intended meaning when correcting sentences.
Use the requested explanation language exactly.
Keep explanations short, simple, and factually accurate.
Do not add unrelated grammar rules."""

PROMPTS = [
    "صحح الجملة التالية، ثم اشرح الخطأ بالعربية بجملة واحدة فقط: أنا يذهب إلى الجامعة كل يوم.",
    "صحح الجملة التالية مع الحفاظ على المعنى المقصود: البنت صغير وجميل.",
    "صحح الجملة التالية، ثم اشرح الخطأ باللغة الإنجليزية باختصار: هذا سيارة جديدة.",
    "صحح الجملة التالية دون تغيير معناها، ثم اشرح الخطأ بالعربية: نحن سافر إلى جدة الأسبوع الماضي.",
    "صحح الجملة التالية، ثم اشرح الخطأ باختصار: أختي يحب قراءة الكتب قبل النوم.",
    "صحح الجملة التالية مع الحفاظ على الزمن والمعنى، ثم اشرح سبب التصحيح: عندما وصلت إلى المحطة، القطار يغادر بالفعل.",
    "Correct the sentence, then explain the mistake briefly in English: My brother play football every weekend.",
    "Correct the sentence, then explain the mistake in Arabic: I have seen him yesterday.",
    "Correct the sentence without changing its intended meaning, then explain the mistake briefly in English: If I knew about the meeting yesterday, I would have attended it.",
    "ترجم إلى الإنجليزية ترجمة طبيعية: أريد كوباً من الماء من فضلك.",
    "ترجم إلى الإنجليزية ترجمة طبيعية دون إضافة أي شرح: لم أذهب إلى العمل اليوم لأنني كنت متعباً.",
    "ترجم إلى الإنجليزية مع الحفاظ على المعنى والنبرة: على الرغم من أن الرحلة كانت طويلة، فإنني استمتعت بكل لحظة فيها.",
    "ترجم إلى العربية ترجمة طبيعية مناسبة لمتعلم مبتدئ: Where is the nearest bus station?",
    "ترجم إلى العربية ترجمة طبيعية: I have been studying Arabic for six months, but speaking is still difficult for me.",
    "أنا متعلم مبتدئ للعربية وأريد أن أسأل موظف المطعم عن سعر الوجبة. أعطني جملة عربية طبيعية واحدة فقط أستطيع قولها.",
    "You are helping me practice Arabic. I want to politely ask someone for directions to the train station. Give me one natural Arabic sentence, then explain it briefly in English.",
    "أنا في متجر وأريد أن أقول للبائع إن المقاس صغير وأريد مقاساً أكبر. أعطني ما أقوله بالعربية بشكل طبيعي، دون شرح.",
    "اشرح باللغة الإنجليزية وباختصار الفرق في المعنى بين: \"كنت أدرس العربية\" و\"درست العربية\".",
    "Explain in simple Arabic the difference between \"I used to work here\" and \"I am used to working here.\" Give one short example for each.",
    "صحح الجملة التالية: \"هم يدرس اللغة العربية كل يوم.\" أجب بجملتين فقط: الجملة الأولى للتصحيح، والجملة الثانية لشرح الخطأ باللغة الإنجليزية."
]

results = []

for i, prompt in enumerate(PROMPTS, start=1):

    print(f"Running test {i}/20...")

    start_time = time.perf_counter()

    try:
        response = requests.post(
            URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "instructions": SYSTEM_PROMPT,
                "input": prompt,
                "max_output_tokens": 300,
            },
            timeout=120,
        )

        latency = time.perf_counter() - start_time

        data = response.json()

        # Extract response text from Responses API
        response_text = "".join(
            content.get("text", "")
            for item in data.get("output", [])
            for content in item.get("content", [])
            if content.get("type") == "output_text"
        )

        usage = data.get("usage", {})

        result = {
            "test_id": i,
            "prompt": prompt,
            "response": response_text,
            "latency_seconds": round(latency, 4),
            "prompt_tokens": usage.get("input_tokens"),
            "completion_tokens": usage.get("output_tokens"),
            "total_tokens": usage.get("total_tokens"),
            "temperature": TEMPERATURE,
            "status_code": response.status_code,
            "finish_reason": data.get("status"),
        }

    except Exception as e:
        latency = time.perf_counter() - start_time

        result = {
            "test_id": i,
            "prompt": prompt,
            "response": "",
            "latency_seconds": round(latency, 4),
            "prompt_tokens": None,
            "completion_tokens": None,
            "total_tokens": None,
            "temperature": TEMPERATURE,
            "status_code": None,
            "finish_reason": "error",
            "error": str(e),
        }

    results.append(result)

    print(f"  Status: {result['status_code']}")
    print(f"  Latency: {result['latency_seconds']}s")
    print()

output = {
    "model": MODEL,
    "temperature": TEMPERATURE,
    "max_output_tokens": 300,
    "system_prompt": SYSTEM_PROMPT,
    "timestamp": datetime.now().isoformat(),
    "results": results,
}

output_file = "gpt-5.6-terra-evaluation-results.json"

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("=" * 50)
print("Evaluation completed.")
print(f"Saved to: {output_file}")
print(f"Total tests: {len(results)}")
print(f"Successful: {sum(r['status_code'] == 200 for r in results)}")
print("=" * 50)