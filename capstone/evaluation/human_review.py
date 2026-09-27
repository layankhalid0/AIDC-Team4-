import json
from pathlib import Path
import html

BASE = Path(__file__).parent

FILES = {
    "Qwen": BASE / "benchmark_qwen3-8b-awq.json",
    "ALLaM": BASE / "benchmark_allam-7b.json",
    "GPT": BASE / "benchmark_gpt-5.6-terra.json",
}

OUTPUT = BASE / "model_comparison_results.html"


def load_results(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return {item["id"]: item for item in data["results"]}


# Load all model results
models = {
    name: load_results(path)
    for name, path in FILES.items()
}


# Find test cases that exist in all three models
common_ids = set.intersection(
    *(set(results.keys()) for results in models.values())
)


# Sort test cases numerically: TC_1, TC_2, TC_3, ...
selected = sorted(
    common_ids,
    key=lambda x: int(x.split("_")[1])
)


html_parts = []

html_parts.append("""
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<title>Model Answer Comparison</title>

<style>

body {
    font-family: Arial, sans-serif;
    max-width: 1400px;
    margin: 30px auto;
    padding: 20px;
    background: #f7f7f7;
}

h1 {
    text-align: center;
    margin-bottom: 10px;
}

.test {
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 25px;
    margin: 30px 0;
}

.test-header {
    margin-bottom: 20px;
}

.prompt {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0 25px 0;
}

.models {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.model {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 18px;
    background: #fff;
}

.model h3 {
    margin-top: 0;
    text-align: center;
    font-size: 20px;
}

.response {
    white-space: pre-wrap;
    line-height: 1.6;
    min-height: 150px;
}

.score {
    margin-top: 15px;
}

.score input {
    width: 70px;
    padding: 7px;
}

.notes {
    margin-top: 10px;
}

.notes textarea {
    width: 100%;
    min-height: 80px;
    box-sizing: border-box;
    padding: 8px;
}

.meta {
    color: #666;
    font-size: 14px;
}

@media (max-width: 900px) {

    .models {
        grid-template-columns: 1fr;
    }

}

</style>

</head>

<body>

<h1>Model Answer Comparison</h1>

<p>
Total common test cases:
<strong>""" + str(len(selected)) + """</strong>
</p>
""")


# Create a section for each test case
for tc_id in selected:

    # Use Qwen as the source for shared test information
    ref = models["Qwen"][tc_id]

    prompt = html.escape(
        str(ref.get("prompt", ""))
    )

    expected = html.escape(
        str(ref.get("expected_behavior", ""))
    )

    category = html.escape(
        str(ref.get("category", ""))
    )

    level = html.escape(
        str(ref.get("level", ""))
    )

    language = html.escape(
        str(ref.get("language", ""))
    )


    html_parts.append(f"""
<div class="test">

    <div class="test-header">

        <h2>{html.escape(tc_id)}</h2>

        <div class="meta">

            Level: {level} |
            Category: {category} |
            Language: {language}

        </div>

    </div>


    <div class="prompt">

        <strong>Prompt:</strong>

        <p>{prompt}</p>


        <strong>Expected Behavior:</strong>

        <p>{expected}</p>

    </div>


    <div class="models">
""")


    # Display the three models
    for model_name in ["Qwen", "ALLaM", "GPT"]:

        response = html.escape(
            str(
                models[model_name][tc_id].get(
                    "response",
                    ""
                )
            )
        )


        html_parts.append(f"""
        <div class="model">

            <h3>{model_name}</h3>

            <div class="response">
                {response}
            </div>

            <div class="score">

                <strong>Score:</strong>

                <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="1-5"
                >

            </div>


            <div class="notes">

                <strong>Notes:</strong>

                <textarea
                    placeholder="Write your notes..."
                ></textarea>

            </div>

        </div>
""")


    html_parts.append("""
    </div>

</div>
""")


# Close HTML
html_parts.append("""
</body>
</html>
""")


# Save the HTML file
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write("".join(html_parts))


# Print result
print("=" * 50)
print("MODEL COMPARISON CREATED")
print("=" * 50)
print(f"Common test cases: {len(selected)}")
print(f"Output: {OUTPUT}")

print("\nOpen this file in your browser:")
print(OUTPUT)