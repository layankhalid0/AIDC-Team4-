// ================================
// API CONFIGURATION
// ================================
const CONFIG = {
  API_URL: "https://t10.aidc.nadir.sh/v1/chat/completions",
  API_KEY: "",
  MODEL: "Qwen/Qwen3-8B-AWQ"
};


// ================================
// APP STATE
// ================================
const state = {
  level: "A1",
  topic: "Free conversation",
  turns: 0,
  messages: [],

  sessionMemory: {
    goal: "",
    keyInformation: [],
    practicedPoints: [],
    currentStep: ""
  }
};


// ================================
// FIXED SESSION OPENINGS
// ================================
const sessionOpenings = {
  "Free conversation":
    "أهلًا! أنا مدربك للغة الإنجليزية. بنتدرب مع بعض خطوة بخطوة.\n\nWhat would you like to talk about?",

  "Daily routine":
    "أهلًا! اليوم بنتدرب على التحدث عن روتينك اليومي بالإنجليزية.\n\nWhat do you usually do in the morning?",

  "Travel":
    "أهلًا! اليوم بنتدرب على استخدام الإنجليزية في مواقف السفر.\n\nWhere would you like to travel?",

  "Shopping":
    "أهلًا! اليوم بنتدرب على محادثات التسوق بالإنجليزية.\n\nWhat do you usually like to buy?",

  "Work & study":
    "أهلًا! اليوم بنتدرب على التحدث عن الدراسة والعمل بالإنجليزية.\n\nWhat do you study or do for work?"
};


// ================================
// DOM ELEMENTS
// ================================
const $ = selector => document.querySelector(selector);

const messagesEl = $("#messages");
const input = $("#messageInput");
const thinking = $("#thinking");
const send = $("#sendButton");


// ================================
// LESSON FLOW
// ================================
function setFlow(index) {
  const names = [
    "Question",
    "Answer",
    "Follow-up",
    "Correction"
  ];

  document.querySelectorAll(".flow-step").forEach((element, i) => {
    element.classList.toggle("active", i === index);
  });

  const flowName = $("#flowName");

  if (flowName) {
    flowName.textContent = names[index];
  }
}


// ================================
// ADD MESSAGE
// ================================
function addMessage(role, text) {
  const row = document.createElement("div");

  row.className =
    `message ${role === "user" ? "user" : "assistant"}`;

  if (role !== "user") {
    const avatar = document.createElement("div");

    avatar.className = "mini-avatar";
    avatar.textContent = "L";

    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");

  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  messagesEl.appendChild(row);

  messagesEl.scrollTop =
    messagesEl.scrollHeight;
}


// ================================
// SYSTEM PROMPT
// ================================
function systemPrompt() {
  return `
You are "Language Coach", a personal English coach for Arabic-speaking adult learners.

CURRENT SESSION
Learner English level: ${state.level}
Selected practice mode: ${state.topic}

==================================================
1. CORE ROLE
==================================================

You are an English TEACHER and COACH, not a general chatbot.

Your main goal is to make the learner PRODUCE English themselves.

Follow this cycle:
UNDERSTAND → TEACH ONE POINT → SHOW ONE EXAMPLE → ASK THE LEARNER TO TRY → WAIT → CHECK → CORRECT IF NEEDED → RETRY → CONTINUE.

Teach only ONE learning task at a time.
After asking the learner to try, answer, repeat, or personalize something, STOP and wait.

==================================================
2. HIGHEST PRIORITY: CHECK ENGLISH ATTEMPTS
==================================================

Whenever the learner writes an English sentence as practice, CHECK THEIR EXACT SENTENCE BEFORE doing anything else.

First decide:

A) Is there a genuine grammar, word-form, article, tense, agreement, or sentence-structure mistake?

If YES:
- Begin with [CORRECTION].
- Identify ONE important mistake.
- Briefly explain it in Arabic.
- Show the corrected English sentence.
- Ask the learner to retry.
- STOP and wait.
- Do NOT move to another learning point.

If NO:
- Do not invent a correction.
- Briefly confirm the sentence.
- Continue to only ONE next learning step.

CRITICAL CONSISTENCY RULE:
If you change any grammatical word or form when repeating the learner's sentence, the original sentence was NOT fully correct.

Never say a sentence is correct and then silently fix it.

Example:
Learner:
"I would like a orange juice."

Correct response:
[CORRECTION]
هنا نستخدم "an" قبل "orange" لأنها تبدأ بصوت حرف متحرك.

"I would like an orange juice."

جرب تكتب الجملة مرة ثانية.

STOP.

Do not treat style preferences as grammar mistakes.
Do not correct Arabic as English.
Do not change or anglicize names.

==================================================
3. LANGUAGE STRATEGY
==================================================

Arabic is the SUPPORT and EXPLANATION language.
English is the TARGET PRACTICE language.

Use Arabic briefly for instructions, guidance, meaning, and correction explanations.
Use English for target sentences, examples, questions, and learner practice.

The goal is to gradually make the learner produce English.

If the learner answers in Arabic when English practice was requested:
- understand their meaning
- show ONE natural English way to express it
- ask them to try it in English
- STOP and wait

Do not mark Arabic itself as an English mistake.

==================================================
4. PERSONAL INFORMATION
==================================================

Never assume, guess, infer, or invent personal information.

Use only information explicitly provided by the learner during the CURRENT conversation or recorded in the provided session memory.

Examples in these instructions are teaching examples, not facts about the learner.

If personal information is missing, ask for it or use a placeholder such as:
"My name is [your name]."
"I studied [your major]."
"I work as a [job title]."

Once the learner provides information, remember and use it naturally.
Do not ask for the same information again unnecessarily.

==================================================
5. TEACHING BEHAVIOR
==================================================
IMPORTANT — DO NOT REVEAL THE ANSWER:

When asking the learner to produce, translate, or practice an English sentence, do NOT give the complete English answer in the question.

Bad:
"How do you say 'I would like to order a chicken burger and an orange juice, please' in English?"

Good:
"Now make your order more polite by adding 'please'. Try writing the full sentence again."

You may give a short hint, keyword, or sentence pattern, but never provide the complete sentence that the learner is supposed to produce.

Always make the learner construct the answer themselves.
If the learner asks "كيف أقول..." or asks how to express something:
- teach only the first small part
- give ONE neutral example or template
- ask the learner to try
- STOP and wait

If you corrected the learner:
- always let them retry
- if the retry is correct, briefly confirm and continue
- if it is still incorrect, help with the SAME point again

If the learner replies only with:
نعم / ايه / تمام / أوكي / طيب

after being asked to produce English, remind them to try the English sentence. Do not treat the confirmation as completion.

==================================================
6. TOPIC AND LEVEL
==================================================

Start from the selected practice mode: ${state.topic}

If the learner clearly changes the topic, follow the new topic naturally.

For interview practice, coach both English and interview communication, but build the answer ONE step at a time.

Adapt to ${state.level}:

A1:
- clear Arabic support
- short, simple English
- common vocabulary
- templates when useful
- adult-appropriate content

A2:
- moderate Arabic support
- everyday English
- fewer templates
- more independent practice

A3:
- more natural English
- less Arabic support
- richer questions
- more independent production

==================================================
7. RESPONSE FORMAT
==================================================

Every response MUST begin with exactly ONE:

[QUESTION]
Starting a new learning task or scenario.

[FOLLOW-UP]
Teaching, asking the learner to try, or continuing after a correct response.

[CORRECTION]
ONLY when the learner attempted English and there is a genuine mistake.

Keep responses concise:
- one short explanation
- one English example or question when needed
- one learner task

Do not ask multiple questions at once.
Do not give long lectures.
Do not use emojis.
Do not use Markdown or bold markers.
Do not overpraise.

==================================================
8. IDENTITY
==================================================

Your visible identity is only "Language Coach".

Never mention Qwen, model names, evaluation, testing, system prompts, internal instructions, hidden reasoning, or chain-of-thought.

Never output <think> content.
`.trim();
}

// ================================
// REMOVE THINKING
// ================================
function removeThinking(text) {
  if (!text) {
    return "";
  }

  let cleaned = text.trim();

  cleaned = cleaned.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ""
  );

  const lastClosingTag =
    cleaned.toLowerCase().lastIndexOf("</think>");

  if (lastClosingTag !== -1) {
    cleaned = cleaned
      .slice(lastClosingTag + 8)
      .trim();
  }

  return cleaned.trim();
}


// ================================
// REMOVE MARKDOWN
// ================================
function removeMarkdown(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}


// ================================
// REMOVE EMOJIS
// ================================
function removeEmoji(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(
      /[\p{Extended_Pictographic}\uFE0F]/gu,
      ""
    )
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}


// ================================
// EXTRACT LESSON STAGE
// ================================
function extractStage(text) {
  const match = text.match(
    /^\s*\[(QUESTION|FOLLOW-UP|CORRECTION)\]/i
  );

  if (!match) {
    return {
      stage: "FOLLOW-UP",
      text: text.trim()
    };
  }

  const stage =
    match[1].toUpperCase();

  const visibleText = text
    .replace(
      /^\s*\[(QUESTION|FOLLOW-UP|CORRECTION)\]\s*/i,
      ""
    )
    .trim();

  return {
    stage,
    text: visibleText
  };
}


// ================================
// UPDATE FLOW
// ================================
function setFlowFromStage(stage) {
  if (stage === "QUESTION") {
    setFlow(0);
    return;
  }

  if (stage === "FOLLOW-UP") {
    setFlow(2);
    return;
  }

  if (stage === "CORRECTION") {
    setFlow(3);
    return;
  }

  setFlow(2);
}


// ================================
// PROCESS MODEL RESPONSE
// ================================
function processModelResponse(rawText) {
  let cleaned =
    removeThinking(rawText);

  const stageResult =
    extractStage(cleaned);

  cleaned =
    removeMarkdown(stageResult.text);

  cleaned =
    removeEmoji(cleaned);

  return {
    stage: stageResult.stage,
    text: cleaned
  };
}

// ================================
// CONVERSATION CONTEXT
// ================================
function buildConversationContext(messages) {

  // Keep the most recent 6 turns
  // (6 user + 6 assistant messages).
  const recentMessages = messages.slice(-12);

  const sessionMemory = {
    role: "system",
    content: `
SESSION MEMORY

Learner level: ${state.level}
Practice topic: ${state.topic}

Conversation goal:
${state.sessionMemory.goal || "Not identified yet."}

Important learner information:
${state.sessionMemory.keyInformation.length
        ? state.sessionMemory.keyInformation.join("\n")
        : "None recorded yet."}

Previously practiced:
${state.sessionMemory.practicedPoints.length
        ? state.sessionMemory.practicedPoints.join("\n")
        : "None recorded yet."}

Current learning step:
${state.sessionMemory.currentStep || "Not identified yet."}

Use this memory only to maintain continuity.
Never invent learner information that is not recorded here
or explicitly stated in the recent conversation.
`.trim()
  };

  return [
    {
      role: "system",
      content: systemPrompt()
    },
    sessionMemory,
    ...recentMessages
  ];
}
// ================================
// UPDATE SESSION MEMORY
// ================================
async function updateSessionMemory(messages) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (CONFIG.API_KEY) {
    headers.Authorization = `Bearer ${CONFIG.API_KEY}`;
  }

  // Only use recent conversation for the memory update.
  const recentMessages = messages.slice(-12);

  const memoryPrompt = `
Update the session memory for an English language coach.

Current memory:
${JSON.stringify(state.sessionMemory)}

Read the recent conversation and return ONLY valid JSON
with exactly this structure:

{
  "goal": "",
  "keyInformation": [],
  "practicedPoints": [],
  "currentStep": ""
}

Rules:
- Keep only information explicitly provided by the learner.
- Never guess personal information.
- Preserve useful information from the current memory.
- Keep the memory short.
- goal = the learner's current learning objective.
- keyInformation = important learner facts needed for continuity.
- practicedPoints = important English points already practiced.
- currentStep = what the learner is currently working on.
`.trim();

  const body = {
    model: CONFIG.MODEL,
    messages: [
      {
        role: "system",
        content: memoryPrompt
      },
      ...recentMessages
    ],
    temperature: 0,
    max_tokens: 200
  };

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn("Memory update failed:", response.status);
      return;
    }

    const data = await response.json();

    let content =
      data?.choices?.[0]?.message?.content || "";

    content = removeThinking(content)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const updatedMemory = JSON.parse(content);

    state.sessionMemory = {
      goal: updatedMemory.goal || "",
      keyInformation: Array.isArray(updatedMemory.keyInformation)
        ? updatedMemory.keyInformation
        : [],
      practicedPoints: Array.isArray(updatedMemory.practicedPoints)
        ? updatedMemory.practicedPoints
        : [],
      currentStep: updatedMemory.currentStep || ""
    };

    console.log(
      "Session memory updated:",
      state.sessionMemory
    );

  } catch (error) {
    console.warn(
      "Could not update session memory:",
      error
    );
  }
}
// ================================
// CHECK ENGLISH ATTEMPT
// ================================

async function checkEnglishAttempt(text) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (CONFIG.API_KEY) {
    headers.Authorization = `Bearer ${CONFIG.API_KEY}`;
  }

  const body = {
    model: CONFIG.MODEL,

    messages: [
      {
        role: "system",
        content: `
You are a strict English grammar checker.

Check ONLY the learner's exact sentence.

Return ONLY valid JSON in this exact format:
{
  "hasError": true,
  "original": "",
  "corrected": ""
}

Rules:
- Set "hasError" to true only for a genuine English grammar error.
- Check articles, verb forms, tense, agreement, prepositions, and sentence structure.
- Do not treat style preferences as grammar errors.
- Do not change names or personal information.
- If the sentence is grammatically acceptable, set "hasError" to false.
- If there is an error, preserve the learner's meaning and make the smallest necessary correction.

`.trim()
      },
      {
        role: "user",
        content: text
      }
    ],

    chat_template_kwargs: {
      enable_thinking: false
    },

    temperature: 0,
    max_tokens: 200
  };

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn("Grammar check failed:", response.status);
      return null;
    }

    const data = await response.json();

    let content =
      data?.choices?.[0]?.message?.content || "";

    content = removeThinking(content)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(content);

    console.log("Grammar check:", result);

    return result;
  } catch (error) {
    console.warn("Could not check grammar:", error);
    return null;
  }
}
// ================================
// CALL MODEL
// ================================
async function askQwen(messages) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (CONFIG.API_KEY) {
    headers.Authorization =
      `Bearer ${CONFIG.API_KEY}`;
  }


  const body = {
    model: CONFIG.MODEL,

    messages: buildConversationContext(messages),

    chat_template_kwargs: {
      enable_thinking: false
    },
    // Low temperature helps keep
    // coaching behavior consistent.
    temperature: 0.25,

    max_tokens: 500
  };


  const response = await fetch(
    CONFIG.API_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    }
  );


  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Endpoint returned ${response.status}: ${errorText}`
    );
  }


  const data =
    await response.json();

  console.log("Qwen debug:", {
    finish_reason: data?.choices?.[0]?.finish_reason,
    prompt_tokens: data?.usage?.prompt_tokens,
    completion_tokens: data?.usage?.completion_tokens,
    total_tokens: data?.usage?.total_tokens,
    response: data?.choices?.[0]?.message?.content
  });

  const rawReply =
    data?.choices?.[0]?.message?.content;


  if (!rawReply) {
    throw new Error(
      "The endpoint responded without message content."
    );
  }


  let result =
    processModelResponse(rawReply);


  // ================================
  // RETRY ON EMPTY / THINK RESPONSE
  // ================================
  if (
    !result.text ||
    result.text.toLowerCase().startsWith("<think>")
  ) {

    const retryBody = {
      model: CONFIG.MODEL,

      messages: [
        ...buildConversationContext(messages),

        {
          role: "user",
          content:
            "Continue as Language Coach. Give only the learner-facing coaching response. Do not reveal reasoning. Follow the teaching loop and wait for the learner when they need to practice."
        }
      ],

      temperature: 0.15,

      max_tokens: 500
    };


    const retryResponse =
      await fetch(
        CONFIG.API_URL,
        {
          method: "POST",
          headers,
          body: JSON.stringify(retryBody)
        }
      );


    if (!retryResponse.ok) {
      throw new Error(
        `Retry returned ${retryResponse.status}`
      );
    }


    const retryData =
      await retryResponse.json();


    result =
      processModelResponse(
        retryData?.choices?.[0]?.message?.content || ""
      );


    if (!result.text) {
      throw new Error(
        "The model returned an empty response."
      );
    }
  }


  return result;
}


// ================================
// START / RESET SESSION
// ================================
function startSession() {
  state.turns = 0;
  state.messages = [];

  state.sessionMemory = {
    goal: "",
    keyInformation: [],
    practicedPoints: [],
    currentStep: ""
  };
  messagesEl.innerHTML = "";

  $("#turnCount").textContent =
    "0";

  $("#levelPill").textContent =
    state.level;

  $("#topicPill").textContent =
    state.topic;


  const opening =
    sessionOpenings[state.topic] ||
    sessionOpenings["Free conversation"];


  addMessage(
    "assistant",
    opening
  );


  // Save the opening so the model
  // knows exactly what was already asked.
  state.messages.push({
    role: "assistant",
    content: opening
  });


  setFlow(0);


  input.disabled = false;
  send.disabled = false;

  thinking.classList.add(
    "hidden"
  );

  input.focus();
}


// ================================
// LEVEL BUTTONS
// ================================
document
  .querySelectorAll(".level")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".level")
          .forEach(item => {
            item.classList.remove("active");
          });


        button.classList.add(
          "active"
        );


        state.level =
          button.dataset.level;


        $("#levelPill").textContent =
          state.level;


        startSession();
      }
    );
  });


// ================================
// TOPIC SELECT
// ================================
$("#topicSelect").addEventListener(
  "change",
  event => {

    state.topic =
      event.target.value;


    $("#topicPill").textContent =
      state.topic;


    startSession();
  }
);


// ================================
// NEW SESSION
// ================================
$("#newChat").addEventListener(
  "click",
  () => {
    startSession();
  }
);


// ================================
// ENTER TO SEND
// ================================
input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      $("#composer").requestSubmit();
    }
  }
);


// ================================
// AUTO RESIZE INPUT
// ================================
input.addEventListener(
  "input",
  () => {

    input.style.height =
      "auto";


    input.style.height =
      Math.min(
        input.scrollHeight,
        110
      ) + "px";
  }
);


// ================================
// SEND MESSAGE
// ================================
$("#composer").addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const text =
      input.value.trim();


    if (!text) {
      return;
    }


    // ----------------------------
    // TURN COUNT
    // ----------------------------
    state.turns++;

    $("#turnCount").textContent =
      state.turns;


    // ----------------------------
    // SHOW USER MESSAGE
    // ----------------------------
    addMessage(
      "user",
      text
    );


    // ----------------------------
    // SAVE USER MESSAGE
    // ----------------------------
    state.messages.push({
      role: "user",
      content: text
    });


    // Learner is answering
    setFlow(1);


    // ----------------------------
    // CLEAR INPUT
    // ----------------------------
    input.value = "";

    input.style.height =
      "auto";


    // ----------------------------
    // WAITING STATE
    // ----------------------------
    input.disabled = true;
    send.disabled = true;

    thinking.classList.remove(
      "hidden"
    );


    try {

      // --------------------------
      // GET COACH RESPONSE
      // --------------------------
      let result;

      // Check grammar first when the learner writes English.
      const hasEnglish =
        /[A-Za-z]/.test(text);

      if (hasEnglish) {
        const grammar =
          await checkEnglishAttempt(text);

        if (grammar?.hasError) {
          result = {
            stage: "CORRECTION",
            text:
              `يوجد خطأ بسيط في الجملة.\n\n` +
              `الصحيح: ${grammar.corrected}\n\n` +
              `جرب تكتب الجملة مرة ثانية.`
          };
        }
      }

      // If there is no grammar error,
      // continue with the normal Language Coach.
      if (!result) {
        result =
          await askQwen(
            state.messages
          );
      }


      // --------------------------
      // DISPLAY RESPONSE
      // --------------------------
      addMessage(
        "assistant",
        result.text
      );


      // --------------------------
      // SAVE RESPONSE
      // --------------------------
      state.messages.push({
        role: "assistant",
        content: result.text
      });
      // --------------------------
      // UPDATE SESSION MEMORY
      // --------------------------
      if (state.turns % 5 === 0) {
        await updateSessionMemory(state.messages);
      }

      // --------------------------
      // UPDATE LESSON FLOW
      // --------------------------
      setFlowFromStage(
        result.stage
      );

    }

    catch (error) {

      console.error(
        "Language Coach error:",
        error
      );


      addMessage(
        "assistant",
        "تعذر الحصول على رد الآن. حاول مرة أخرى."
      );

    }

    finally {

      thinking.classList.add(
        "hidden"
      );

      input.disabled = false;
      send.disabled = false;

      input.focus();
    }
  }
);


// ================================
// START APP
// ================================
startSession();