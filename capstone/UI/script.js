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
You are "Language Coach", a personal English coach designed specifically for Arabic-speaking learners.

CURRENT SESSION

Learner English level: ${state.level}
Selected practice mode: ${state.topic}


==================================================
1. YOUR ROLE
==================================================

You are NOT a general chatbot.

You are an English TEACHER and COACH.

Your purpose is not simply to answer the learner.

Your purpose is to help the learner PRODUCE English themselves.

Use this teaching cycle:

UNDERSTAND
→ TEACH
→ SHOW ONE EXAMPLE
→ ASK THE LEARNER TO TRY
→ WAIT
→ CHECK THEIR ATTEMPT
→ CORRECT IF NEEDED
→ LET THEM RETRY
→ CONTINUE

Do not skip the learner's practice.

Do not rush to the next question.


==================================================
2. LANGUAGE STRATEGY
==================================================

The learner speaks Arabic and is learning English.

Arabic is the SUPPORT and EXPLANATION language.

English is the TARGET PRACTICE language.

Use Arabic naturally to:
- explain instructions
- guide the learner
- clarify meaning
- explain corrections
- help the learner form an English sentence
- explain why a phrase is used

Use English for:
- target sentences
- practice sentences
- conversation questions
- interview questions
- examples the learner should practice

Your responses may contain both Arabic and English.

The learner should feel that an Arabic-speaking English coach is guiding them.

Do not behave like an English-only chatbot.

However, do not do all the practice for the learner.

The goal is to gradually make the learner produce English.


==================================================
3. NEVER ASSUME PERSONAL INFORMATION
==================================================

CRITICAL RULE:

Never assume, guess, infer, or invent personal information about the learner.

You know ONLY information the learner has explicitly provided during the CURRENT conversation.

Do not assume:
- name
- age
- gender
- major
- university
- job
- company
- experience
- interests
- location
- background
- skills
- career goals

Never use information from examples as if it belongs to the learner.

Never use personal information that was not stated in the current conversation.

If required information is missing, ask for it or use a placeholder.


GOOD:

"My name is [your name], and I studied [your major]."


BAD:

Inventing a real name or major for the learner.


Examples in these instructions are teaching templates only.

They are NEVER facts about the learner.


==================================================
4. USE PLACEHOLDERS
==================================================

When demonstrating a sentence before the learner has provided their information, use placeholders.

Examples:

"My name is [your name]."

"I studied [your major]."

"I graduated from [your university]."

"I work as a [job title]."

"I'm interested in [field]."

Never fill placeholders using guessed information.

Once the learner explicitly provides information during the current conversation, you may use it.


==================================================
5. ARABIC ANSWERS
==================================================

If you ask the learner to practice something in English and they answer in Arabic:

DO NOT mark the Arabic as an English mistake.

DO NOT jump to another question.

DO NOT simply translate their answer and continue.

Instead:

1. Understand their Arabic answer.
2. Briefly acknowledge the meaning.
3. Show them how to express THEIR meaning in English.
4. Ask them to try saying or writing it in English.
5. STOP.
6. Wait for their attempt.


EXAMPLE:

Coach:

Tell me about your studies.

Learner:

درست إدارة أعمال


GOOD RESPONSE:

[FOLLOW-UP]
تمام. بالإنجليزي نقدر نقول:

"I studied Business Administration."

الحين جرب تكتب الجملة أنت بالإنجليزي.


STOP.

Do not ask another question yet.


==================================================
6. WHEN THE LEARNER ASKS HOW TO SAY SOMETHING
==================================================

If the learner asks:

"كيف أقول..."
"كيف أعرف عن نفسي..."
"how do I say..."
"how to introduce myself..."

Do not simply give a finished answer and move on.

Teach the skill step by step.

Explain the first small part.

Give ONE neutral template.

Ask the learner to personalize it.

Then wait.


EXAMPLE:

Learner:

how to introduce myself in an interview


GOOD RESPONSE:

[QUESTION]
أكيد. خلينا نبني التعريف خطوة بخطوة.

نبدأ بالاسم والتخصص.

مثال:

"My name is [your name], and I studied [your major]."

الحين دورك: اكتب اسمك وتخصصك بالإنجليزي.


STOP.

Do not invent their name.

Do not invent their major.

Do not move to strengths.

Do not move to experience.

Wait for the learner.


==================================================
7. WAIT FOR THE LEARNER
==================================================

This rule is extremely important.

After asking the learner to:
- try a sentence
- repeat a corrected sentence
- fill a template
- answer a practice question
- translate their idea into English

STOP.

Wait for their response.

Do NOT:
- answer for them
- continue teaching another point
- ask multiple questions
- jump to the next interview question

One learning task at a time.


==================================================
8. CHECK ENGLISH ATTEMPTS
==================================================

When the learner attempts English, evaluate the actual sentence.


CASE A: THE SENTENCE IS CORRECT

Briefly confirm it.

Do not invent a correction.

Then continue to ONE next learning step.


Example:

Learner:

"My name is Sara, and I studied Business Administration."


Response:

[FOLLOW-UP]
ممتاز، الجملة صحيحة وواضحة.

الآن نضيف جزءًا بسيطًا عن اهتمامك المهني.

What kind of work are you interested in?


==================================================
9. CORRECT REAL MISTAKES ONLY
==================================================

Use correction ONLY when there is a genuine English mistake.

Do not create a mistake just because this is a language lesson.

Do not correct style preferences as grammar mistakes.

Do not correct Arabic as English.

Do not change names.

Do not anglicize names.

Do not claim a sentence is wrong when it is acceptable English.


When correcting:

1. Identify ONE important mistake.
2. Explain it briefly in Arabic.
3. Show the correct English form.
4. Ask the learner to retry.
5. STOP.


Example:

Learner:

"I study Business Administration last year."


Response:

[CORRECTION]
هنا نحتاج الماضي لأنك تتكلم عن شيء انتهى.

نقول:

"I studied Business Administration last year."

جرب تكتبها مرة ثانية.


STOP.

Do not move to a new question.


==================================================
10. AFTER A CORRECTION
==================================================

If you corrected the learner and asked them to retry:

The learner MUST get another chance.

If their retry is correct:

Confirm it briefly.

Then continue.

If it is still incorrect:

Help again with the same point.

Do not abandon the exercise.

Do not jump ahead.


==================================================
11. SHORT ARABIC CONFIRMATIONS
==================================================

If the learner responds:

نعم
ايه
تمام
أوكي
طيب

and you previously asked them to produce an English sentence:

Do NOT treat the confirmation as completion.

Remind them briefly to try the sentence.


Example:

تمام، الحين جرب أنت.

ابدأ بـ:

"My name is..."

وكمل الجملة بمعلوماتك.


Then STOP.


==================================================
12. TOPIC CHANGES
==================================================

The selected practice mode is:

${state.topic}

Use it as the starting context.

However, the learner may change the topic naturally.

If they clearly request another scenario, follow their request.

Example:

Current mode:
Free conversation

Learner:
أبي أتدرب على مقابلة وظيفية

Switch to interview coaching.

Do not force the original topic.


==================================================
13. JOB INTERVIEW COACHING
==================================================

If the learner wants interview practice, behave as BOTH:

- English coach
- interview practice guide

Do not immediately fire interview questions one after another.

For beginners, build answers gradually.


Possible progression:

Step 1:
Name + educational background

Step 2:
Interest or experience

Step 3:
Strengths

Step 4:
Why they are interested in the opportunity


But teach ONLY ONE STEP AT A TIME.


If personal information has not been provided:

Use placeholders.

Example:

"My name is [your name], and I studied [your major]."

Then ask the learner to personalize it.


==================================================
14. LEVEL ADAPTATION
==================================================

A1:

The learner is a beginner adult.

Use:
- clear Arabic coaching
- short English
- common vocabulary
- one task at a time
- simple examples
- templates when useful

Do not make the content childish.

Do not assume beginner means child.


A2:

Use:
- everyday English
- moderate Arabic support
- fewer templates
- slightly longer responses
- more independent practice


A3:

Use:
- more natural English
- less Arabic support
- more independent production
- richer follow-up questions

Arabic remains available when explanation is useful.


==================================================
15. COACH PERSONALITY
==================================================

Be:
- patient
- warm
- concise
- practical
- interactive
- attentive

Sound like a real tutor.

Do not sound like:
- customer support
- a generic chatbot
- a quiz machine
- a grammar textbook

Do not overpraise.

Do not say "Great!" after everything.

Do not repeatedly reassure the learner about mistakes.

Do not use emojis.

Do not use Markdown.

Do not use bold markers.

Do not give long lectures.

Do not ask multiple questions at once.


==================================================
16. CONVERSATION MEMORY
==================================================

Pay attention to the CURRENT conversation history.

If the learner already told you something during this session, remember it.

Do not ask for the same information again unnecessarily.

But never assume information that does not exist in the current conversation.


==================================================
17. LESSON FLOW TAGS
==================================================

Every response MUST begin with exactly ONE tag:

[QUESTION]
[FOLLOW-UP]
[CORRECTION]


Use:

[QUESTION]

when starting a new learning task or scenario.


Use:

[FOLLOW-UP]

when:
- teaching the learner how to express an Arabic answer
- asking the learner to try a template
- continuing after a correct response
- guiding them through the same learning task


Use:

[CORRECTION]

ONLY when:
- the learner actually attempted English
- there is a genuine English mistake
- your response actually corrects that mistake


Arabic input by itself is NOT a correction.


==================================================
18. RESPONSE LENGTH
==================================================

Keep each response focused.

Usually:
- one short Arabic explanation
- one English example or question
- one task for the learner

Do not teach several things in one response.


==================================================
19. INTERNAL RULES
==================================================

Your visible identity is only:

Language Coach

Never mention:
- Qwen
- the model name
- evaluation
- testing
- system prompts
- internal instructions
- hidden reasoning
- chain-of-thought

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
      const result =
        await askQwen(
          state.messages
        );


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