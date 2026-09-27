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
    "صحح الجملة التالية، ثم اشرح الخطأ باختصار وبأسلوب مناسب لمتعلم مبتدئ: هي يذهب إلى المدرسة كل يوم.",

    "صحح الجملة التالية مع الحفاظ على المعنى المقصود، ثم اشرح الخطأ باختصار: أنا أكلت الماء لأنني عطشان.",

    "صحح الجملة التالية، ثم اشرح الخطأ باللغة الإنجليزية: نحن ذهبت إلى السوق أمس.",

    "صحح الجملة التالية، ثم أعطِ تفسيراً بسيطاً لمتعلم مبتدئ: هذه كتاب جديد.",

    "Correct the following sentence, then explain the mistake in Arabic: She go to university every day.",

    "Correct the following sentence, then explain the mistake in Arabic: They was happy yesterday.",

    "ترجم الجملة التالية إلى الإنجليزية ترجمة طبيعية: أنا أتعلم العربية لأنني أريد التحدث مع أصدقائي.",

    "ترجم إلى العربية ترجمة طبيعية مناسبة للمحادثة اليومية: I usually drink coffee in the morning, but today I drank tea.",

    "أنا متعلم مبتدئ للغة العربية. أريد أن أطلب قهوة بدون سكر في مقهى. علمني جملة عربية طبيعية أستطيع قولها، ثم اشرحها باختصار باللغة الإنجليزية.",

    'أنا متعلم للغة العربية. قلت لصديقي: "أنا سوف ذهبت إلى المطعم غداً." صحح ما قلته، واشرح لي بالعربية بطريقة بسيطة لماذا هو خطأ.'
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

    print(f"\nRunning prompt {i}/10...")

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

filename = f"eval10_{MODEL_LABEL}.json"

with open(filename, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\n================================")
print("Evaluation completed.")
print("Saved to:", filename)
print("================================")
