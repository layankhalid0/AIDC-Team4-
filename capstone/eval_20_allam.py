import requests
import json
import time
from datetime import datetime

MODEL_NAME = "humain-ai/ALLaM-7B-Instruct-preview"
MODEL_LABEL = "allam-7b"
API_URL = "http://localhost:8048/v1/chat/completions"

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

    'اشرح باللغة الإنجليزية وباختصار الفرق في المعنى بين: "كنت أدرس العربية" و"درست العربية".',

    'Explain in simple Arabic the difference between "I used to work here" and "I am used to working here." Give one short example for each.',

    'صحح الجملة التالية: "هم يدرس اللغة العربية كل يوم." أجب بجملتين فقط: الجملة الأولى للتصحيح، والجملة الثانية لشرح الخطأ باللغة الإنجليزية.'
]

results = []

for i, prompt in enumerate(PROMPTS, start=1):

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
        "temperature": 0.2,
        "max_tokens": 300
    }

    print(f"\nRunning prompt {i}/20...")

    start = time.perf_counter()

    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=120
        )

        latency = time.perf_counter() - start
        response.raise_for_status()
        data = response.json()

        answer = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})

        result = {
            "prompt_id": i,
            "prompt": prompt,
            "response": answer,
            "latency_seconds": round(latency, 4),
            "prompt_tokens": usage.get("prompt_tokens"),
            "completion_tokens": usage.get("completion_tokens"),
            "total_tokens": usage.get("total_tokens"),
            "finish_reason": data["choices"][0].get("finish_reason")
        }

        results.append(result)

        print("Response:", answer)
        print("Latency:", round(latency, 4), "seconds")
        print("Total tokens:", usage.get("total_tokens"))

    except Exception as e:
        print("ERROR:", e)

        results.append({
            "prompt_id": i,
            "prompt": prompt,
            "error": str(e)
        })

output = {
    "model": MODEL_NAME,
    "model_label": MODEL_LABEL,
    "temperature": 0.2,
    "max_tokens": 300,
    "system_prompt": SYSTEM_PROMPT,
    "timestamp": datetime.now().isoformat(),
    "results": results
}

filename = f"eval20_{MODEL_LABEL}.json"

with open(filename, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\n================================")
print("Evaluation completed.")
print("Saved to:", filename)
print("================================")
