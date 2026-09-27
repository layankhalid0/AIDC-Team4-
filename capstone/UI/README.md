# Luma — Arabic Language Coach

A polished text-only frontend for testing the Qwen lesson flow before adding STT/TTS.

## Run
Open `index.html` in a browser. For the most reliable API behavior, serve the folder locally, for example:

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

## Connect the real Qwen endpoint
Open `script.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  API_URL: "https://YOUR-ENDPOINT/v1/chat/completions",
  API_KEY: "YOUR_KEY_IF_NEEDED",
  MODEL: "YOUR_MODEL_ID"
};
```

The request is already written in OpenAI-compatible `/v1/chat/completions` format. If your endpoint uses a different JSON format, only the `askQwen()` function needs to be adjusted.

## Files
- `index.html` — interface structure
- `style.css` — visual design and responsive layout
- `script.js` — interaction, lesson state, demo responses, endpoint integration
