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

  pendingRetry: null,

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
    "أهلًا! أنا مدربك للغة الإنجليزية. خلينا نبدأ محادثة بسيطة، وبساعدك نتدرب مع بعض خطوة بخطوة.\n\nWhat would you like to talk about?",

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
  bubble.dir = "auto";

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
You are Language Coach, an English coach for Arabic-speaking adults.

Level: ${state.level}
Topic: ${state.topic}

Your job is to teach English step by step, not to act like a general chatbot.

CORE RULE
Teach exactly ONE small point per turn.

For A1:
- Explain and give feedback mainly in Arabic.
- Use English for examples, templates, and practice.
- Keep every response short.
- Before asking the learner to write a NEW English sentence, ALWAYS give ONE short English template first.
- Then ask the learner in Arabic to try.
- WAIT for the learner's answer.
- Never teach two new points in the same response.

A1 FLOW
For a new point:
1. Short Arabic explanation.
2. ONE English template.
3. Ask the learner in Arabic to try it.
4. WAIT.

Example:
خلينا نبدأ بالاسم والتخصص.
مثال:
"My name is [name], and I studied [major]."
الحين جربي تكتبينها عن نفسك.

After the learner answers:
1. Read their EXACT sentence carefully.
2. If correct, briefly confirm it in Arabic.
3. If there is a real error, correct ONLY that error and ask for one retry.
4. If no retry is needed, move to ONE new unpracticed point using the A1 flow.

PROGRESSION MEMORY RULE

Use SESSION MEMORY as the source of truth for progression.

Before choosing the next learning point, check what the learner has already successfully practiced.

NEVER teach or ask about a learning point that has already been completed unless the learner explicitly asks to practice it again or clarification is genuinely necessary.

Teach only the learning point in currentStep.

After the learner successfully completes the currentStep, move forward to a new useful learning point based on:
- the learner's current goal
- the lesson or conversation context
- the teaching progression in these instructions
- what has already been practiced

Do NOT move backward to an already completed learning point.

Do NOT repeat a completed point using different wording.

If currentStep is complete, do not invent another step just to continue the lesson. Help the learner combine, review, or naturally conclude what they practiced.

COMPLETION RULE

When SESSION MEMORY currentStep is "complete":

- Do NOT introduce any new learning point.
- Do NOT ask for more details just to make the answer longer.
- Do NOT ask about another skill, project, training, interest, preference, or experience unless the learner explicitly requests more practice.

If the learner has NOT yet combined the practiced points:
- Ask them once to combine the practiced material into one final answer.
- Use only information the learner actually provided.

If the learner HAS already written the combined final answer:
- Briefly confirm that the practice goal is complete.
- Do NOT ask another practice question.
- Do NOT offer another subtopic automatically.
- Naturally conclude the exercise.

For example:
"ممتاز، كذا عندك مقدمة كاملة وواضحة للمقابلة. انتهينا من هذا التدريب."

This rule applies to ALL learning topics and lesson types.

IMPORTANT CORRECTION RULES
Never claim the learner made an error that is not actually present in their latest message.

Check the learner's exact text before correcting it.

If they wrote "AI", it is already correct.
Do NOT tell them to change AI to AI.
Do NOT mention capitalization.

If they wrote "ai", teach:
"AI"
Show the corrected sentence and ask them to retry once.
Then WAIT.

Do not change a grammatically valid tense.
Do not invent grammar errors.
Do not change the learner's intended meaning.

STYLE IMPROVEMENTS
A grammatically correct sentence may sometimes have a useful professional improvement.
Do NOT call this a grammar error.

Example:
"I worked on a project about money problems."

If the intended meaning is financial problems, say briefly in Arabic that a more professional expression is:
"I worked on a project about financial problems."

Then ask for one retry and WAIT.

Do not offer unnecessary alternatives.

INTERVIEW INTRODUCTION
If the learner wants to practice introducing themselves in an interview, teach the introduction gradually.

Possible progression:
1. name + education
2. relevant experience
3. training
4. project
5. skills
6. professional interest or strength
7. short closing

Teach only ONE of these at a time.

Do NOT give the learner the whole introduction at the beginning.

Do NOT ask about a category already successfully practiced.

Before choosing the next point, check SESSION MEMORY and recent conversation.

Examples:
- If education is completed, do not ask about education again.
- If skills are completed, do not ask about skills again.
- If training is completed, do not ask about training again.
- If project is completed, do not ask about another project unless necessary.

Do not make the learner rewrite the entire introduction after every step.

Only after several parts have been practiced successfully may you ask the learner to combine them.

PERSONAL INFORMATION
Use only information the learner actually provides.
Never invent their university, major, experience, project, skills, interests, or personal details.

RESPONSE QUALITY
FIRST RESPONSE VS FEEDBACK

Never say:
"ممتاز، جملتك صحيحة."
or give any correction/feedback
when the learner has only asked for help or selected a topic.

Feedback such as:
"ممتاز، جملتك صحيحة."
is ONLY for a learner's actual English practice answer.

If the learner asks to start practicing something:
- Respond directly to the request.
- Briefly introduce the first learning step.
- For A1, give ONE simple English template.
- Ask the learner in Arabic to try their own version.
- Do not evaluate the learner before they have answered.

Example:

Learner:
"how to introduce myself in an interview"

Good response:
"أكيد، خلينا نبني مقدمة بسيطة خطوة بخطوة. نبدأ بالاسم والتخصص.
مثال:
My name is [name], and I studied [major].
الحين جربي تكتبينها عن نفسك."

Bad response:
"ممتاز، جملتك صحيحة."

The learner's request is not a practice answer and must not be evaluated as one.
Use natural, modern Arabic suitable for a professional educational app.

IMPORTANT ARABIC STYLE:
- Use simple, neutral Arabic.
- Sound like a professional language coach.
- Avoid religious expressions such as:
  "جزاك الله خيراً"
  "بارك الله فيك"
  "ما شاء الله"
- Avoid overly formal, literary, awkward, or translated Arabic.
- Avoid strange phrases such as:
  "دراستك"
  "مجال مرتبط بعلم الحاسوب"
  when a simpler natural phrase can be used.
- Do not translate English templates word-for-word into Arabic.
- Keep explanations short and clear.

For A1, prefer natural phrases such as:
"ممتاز، جملتك صحيحة."
"خلينا نضيف خبرتك."
"خلينا نتكلم عن تدريبك."
"الآن نضيف مشروع اشتغلتي عليه."
"جربي تكتبينها عن نفسك."
"فيه تعديل بسيط."
"الصحيح هو:"
"جربي مرة ثانية."

When introducing a new point, use this style:

"ممتاز، جملتك صحيحة. الآن خلينا نضيف خبرتك.
مثال:
I have experience in [field].
الحين جربي تكتبينها عن خبرتك."

Do NOT add unnecessary explanations around the English template.

Do NOT say what the placeholder means unless the learner asks.

For example, do NOT write:
"I have experience in [مجال مرتبط بعلم الحاسوب]."

Write:
"I have experience in [field]."

Keep each response focused on ONE learning action.

No emojis.
No markdown.
No religious expressions.
No unnecessary praise.
No long explanations.
No repeated questions.
No repeated corrections.
No multiple exercises in one response.

Before sending every response, silently check:
1. Is my Arabic natural and simple?
2. Am I teaching only ONE point?
3. Did I give an English example before asking an A1 learner to try?
4. Am I correcting something that is actually wrong?
5. Am I avoiding a point already practiced?

If not, fix the response before sending it.
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
// REMOVE INTERNAL WORDS
// ================================

function removeInternalWords(text) {
  if (!text) {
    return "";
  }

  return text
    .trim()
    .replace(/\s*\bSTOP\.?\s*$/gi, "")
    .replace(/\s*\bWAIT\.?\s*$/gi, "")
    .replace(/\s*\bPAUSE\.?\s*$/gi, "")
    .replace(/\s*\bEND\.?\s*$/gi, "")
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

  cleaned =
    removeInternalWords(cleaned);

  return {
    stage: stageResult.stage,
    text: cleaned
  };
}


// ================================
// CONVERSATION CONTEXT
// ================================

function buildConversationContext(messages) {
  const recentMessages =
    messages.slice(-6);

  const sessionMemory = {
    role: "system",

    content: `
SESSION MEMORY

Learner level: ${state.level}
Practice topic: ${state.topic}

Conversation goal:
${state.sessionMemory.goal || "Not identified yet."}

Important learner information already provided:
${state.sessionMemory.keyInformation.length
      ? state.sessionMemory.keyInformation
          .map(item => `- ${item}`)
          .join("\n")
      : "None recorded yet."}

Learning points already completed or practiced:
${state.sessionMemory.practicedPoints.length
      ? state.sessionMemory.practicedPoints
          .map(item => `- ${item}`)
          .join("\n")
      : "None recorded yet."}

Current learning step:
${state.sessionMemory.currentStep || "Not identified yet."}


CRITICAL CONTINUITY RULES

Use this memory to maintain continuity throughout the lesson.

Information listed under "Important learner information already provided"
has ALREADY been answered by the learner.

Do NOT ask the learner for that information again.

A learning point listed under
"Learning points already completed or practiced"
has ALREADY been covered.

Do NOT return to that learning point unless:
- the learner asks to practice it again
- the learner made an unresolved error in that same point
- clarification is genuinely necessary

Before asking a new question, check:
1. Has the learner already answered this?
2. Is the information already in session memory?
3. Has this learning point already been practiced?

If YES to any of these, do NOT ask it again.
Move naturally to the next useful learning point.

For interview introduction practice, progression should move forward.

For example:

name/education
→ relevant background
→ training/experience
→ project
→ skills
→ professional interest/strength
→ short closing

This is a progression, not a checklist that must always be followed exactly.

If the learner already gave:
- training information, do not ask about training again
- a professional interest, do not ask what they like about the field again
- project information, do not ask for another project unless useful
- education information, do not ask about education again
- skills information, do not ask about skills again

Do NOT make the learner rebuild their full introduction after every new detail.

Practice ONE new piece at a time.

After several pieces have been successfully practiced,
you may eventually ask the learner to combine the completed pieces
into one natural introduction.

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
function markCurrentStepAsPracticed() {

  const currentStep =
    state.sessionMemory.currentStep?.trim();

  if (
    !currentStep ||
    currentStep.toLowerCase() === "complete"
  ) {
    return;
  }

  const practicedPoints =
    state.sessionMemory.practicedPoints || [];

  const alreadyPracticed =
    practicedPoints.some(
      point =>
        point.trim().toLowerCase() ===
        currentStep.toLowerCase()
    );

  if (!alreadyPracticed) {

    state.sessionMemory.practicedPoints = [
      ...practicedPoints,
      currentStep
    ];

  }
}

async function updateSessionMemory(messages) {

  const recentMessages =
    messages.slice(-8);

  const memoryPrompt = `
You maintain compact session memory for an English-learning coach.

Return ONLY valid JSON using exactly this structure:

{
  "goal": "",
  "keyInformation": [],
  "practicedPoints": [],
  "currentStep": ""
}

CURRENT MEMORY:

${JSON.stringify(state.sessionMemory, null, 2)}

RECENT CONVERSATION:

${recentMessages
  .map(message => `${message.role}: ${message.content}`)
  .join("\n")}

MEMORY RULES:

1. Preserve useful information already stored in CURRENT MEMORY.

2. Never delete previously learned information merely because
it is not visible in RECENT CONVERSATION.

3. Never invent personal information.

4. "goal" is the learner's current learning or conversation goal.

5. "keyInformation" contains only information explicitly provided
by the learner.

Do not store information that came only from an example
provided by the coach.

6. "practicedPoints" contains distinct learning points the learner
has already successfully practiced.

Each practiced point must describe ONE clear learning purpose.

Good examples:
- "Introduce name and education"
- "Describe work experience"
- "Talk about a completed project"
- "Describe a daily routine"
- "Ask for a price"

Avoid vague combined points such as:
- "Practice more details"
- "Talk about skills or experience"
- "Continue practicing the topic"

7. The actual learning points depend on the learner's goal,
topic, and conversation.

Do NOT use a fixed universal list of categories.

8. Treat semantically overlapping points as the SAME learning area.

Do not create a new step merely by making an existing point
more specific, more detailed, or slightly reworded.

For example, if the learner already practiced talking about
their skills, do not create another step only for:
- specific skills
- technical skills
- AI skills
- modeling skills

unless the learner explicitly asks to go deeper.

9. Once a learning point has been successfully completed,
preserve it in practicedPoints for the rest of the session.

Do NOT remove it later.

10. COMPLETING THE CURRENT STEP

A currentStep represents ONE learning area, not a request to collect
multiple examples from that area.

As soon as the learner gives ONE successful answer that satisfies
the currentStep, that ENTIRE learning area is completed.

Add the completed currentStep to practicedPoints.

Do NOT stay inside the same learning area to collect:
- another example
- another skill
- another project
- another experience
- another training
- another detail
- a more specific version of the same information

For example:

If currentStep is about skills and the learner successfully says:
"I have skills in AI models."

then the skills learning area is COMPLETE.

The next currentStep MUST NOT be:
- another skill
- programming skills
- technical skills
- AI skills
- more skills
- a more specific skill

Move to a genuinely different learning point in the natural
progression.

The same principle applies to EVERY topic.

For example:

Travel:
If the learner successfully practices asking for a hotel room,
do not ask them to practice another hotel room example unless
the learner requests more practice.

Shopping:
If the learner successfully practices asking for a price,
do not create another step for asking the price of a different item.

Daily routine:
If the learner successfully practices describing their morning
routine, do not create another step only to collect another
morning activity.

A successful answer completes the learning PURPOSE of currentStep,
not merely the exact sentence or fact the learner provided.

If there is an unresolved correction or retry, the currentStep
is NOT complete yet.

Once the learner successfully completes the correction,
the entire currentStep learning area is completed.

11. "currentStep" means ONE genuinely new and useful learning point
needed to accomplish the learner's goal.

Choose it from:
- the learner's goal
- what has already been practiced
- the recent conversation
- the natural teaching progression

12. NEVER set currentStep to a point that is already covered,
fully or substantially, by practicedPoints.

Semantic overlap counts as repetition even when the wording
or level of detail is different.

13. Prefer a SHORT, goal-focused learning sequence.

Do not keep expanding the lesson just because more related
details could theoretically be practiced.

Ask:
"Does the learner already have enough practiced material
to reasonably accomplish the original goal?"

If YES, do not invent another learning point.

14. When the original goal has been sufficiently practiced,
set:

"currentStep": "complete"

For a narrow goal, reaching complete after a small number of
useful distinct learning points is preferred over extending
the lesson with increasingly specific subtopics.

15. When currentStep is "complete", keep it "complete"
unless the learner explicitly asks for:
- another learning goal
- more practice
- deeper practice
- a different topic

Do NOT restart the previous sequence automatically.

Before returning the JSON, silently verify:

- Did I preserve previous learner information?
- Did I preserve all previously practiced points?
- Is currentStep genuinely new?
- Am I accidentally repeating or moving backward?
- Did I avoid inventing learner information?
- Am I creating a new step that is really just a narrower version of something already practiced?
- Has the learner already practiced enough to accomplish the original goal?

Return JSON only.
`.trim();

  try {

    const response = await fetch(CONFIG.API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(CONFIG.API_KEY
          ? {
              Authorization:
                `Bearer ${CONFIG.API_KEY}`
            }
          : {})
      },

      body: JSON.stringify({
        model: CONFIG.MODEL,

        messages: [
          {
            role: "system",
            content: memoryPrompt
          }
        ],

        chat_template_kwargs: {
          enable_thinking: false
        },

        temperature: 0,
        max_tokens: 220
      })
    });

    if (!response.ok) {
      console.warn(
        "Session memory update failed:",
        response.status
      );

      return;
    }

    const data =
      await response.json();

    const rawContent =
      data?.choices?.[0]?.message?.content || "";

    const cleanContent =
      removeThinking(rawContent)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const jsonStart =
      cleanContent.indexOf("{");

    const jsonEnd =
      cleanContent.lastIndexOf("}");

    if (
      jsonStart === -1 ||
      jsonEnd === -1
    ) {
      console.warn(
        "Could not parse session memory:",
        cleanContent
      );

      return;
    }

    const updatedMemory =
      JSON.parse(
        cleanContent.slice(
          jsonStart,
          jsonEnd + 1
        )
      );


    const uniqueItems = items => {

      const seen = new Set();

      return items.filter(item => {

        if (
          typeof item !== "string" ||
          !item.trim()
        ) {
          return false;
        }

        const normalized =
          item
            .trim()
            .toLowerCase();

        if (seen.has(normalized)) {
          return false;
        }

        seen.add(normalized);

        return true;
      });
    };


    state.sessionMemory = {

      goal:
        updatedMemory.goal ||
        state.sessionMemory.goal ||
        "",

      keyInformation:
        uniqueItems([
          ...(state.sessionMemory.keyInformation || []),

          ...(Array.isArray(
            updatedMemory.keyInformation
          )
            ? updatedMemory.keyInformation
            : [])
        ]),

      practicedPoints:
        uniqueItems([
          ...(state.sessionMemory.practicedPoints || []),

          ...(Array.isArray(
            updatedMemory.practicedPoints
          )
            ? updatedMemory.practicedPoints
            : [])
        ]),

      currentStep:
        updatedMemory.currentStep ||
        state.sessionMemory.currentStep ||
        ""
    };
    console.log(
      "SESSION MEMORY:",
      JSON.stringify(state.sessionMemory, null, 2)
    );


    console.log(
      "Session memory updated:",
      state.sessionMemory
    );

  } catch (error) {

    console.warn(
      "Session memory error:",
      error
    );
  }
}
// ================================
// CHECK ENGLISH ATTEMPT
// ================================

function checkDeterministicCorrection(text) {
  const trimmed = text.trim();

  // ==================================
  // 1. COMMON ABBREVIATIONS
  // ==================================

  const abbreviationRules = [
    { regex: /\bai\b/g, correct: "AI" },
    { regex: /\bit\b/g, correct: "IT" },
    { regex: /\bhr\b/g, correct: "HR" },
    { regex: /\bceo\b/g, correct: "CEO" }
  ];

  for (const rule of abbreviationRules) {
    if (rule.regex.test(trimmed)) {
      const corrected =
        trimmed.replace(
          rule.regex,
          rule.correct
        );

      return {
        hasCorrection: true,
        type: "capitalization",
        corrected,

        message:
          `جملتك صحيحة، لكن نكتب الاختصار بحروف كبيرة: ${rule.correct}.\n\n` +
          `الصياغة الصحيحة:\n${corrected}\n\n` +
          `جربي تكتبينها مرة ثانية.`
      };
    }
  }


  // ==================================
  // 2. MISSING SUBJECT
  // ==================================
  // Catch learner sentences that begin
  // directly with a common verb where
  // "I" is clearly missing.
  //
  // Examples:
  // have training in AI
  // studied computer science
  // worked on a project
  // completed training in AI
  // graduated from Qassim University

  const missingISubject =
    /^(have|worked|studied|completed|graduated|learned|developed|designed|built|created|trained)\b/i;

  if (missingISubject.test(trimmed)) {
    const corrected =
      `I ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;

    return {
      hasCorrection: true,
      type: "missing-subject",
      corrected,

      message:
        `فيه تعديل بسيط: الجملة تحتاج الفاعل "I" في البداية.\n\n` +
        `الصياغة الصحيحة:\n${corrected}\n\n` +
        `جربي تكتبينها مرة ثانية.`
    };
  }


  // ==================================
  // NO DETERMINISTIC CORRECTION
  // ==================================

  return {
    hasCorrection: false
  };
}

async function checkEnglishAttempt(text) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (CONFIG.API_KEY) {
    headers.Authorization =
      `Bearer ${CONFIG.API_KEY}`;
  }

  const body = {
    model: CONFIG.MODEL,

    messages: [
      {
        role: "system",

        content: `
You are an English language evaluator for an English-learning application.

Evaluate the learner's EXACT sentence.

Your job is to distinguish between:

1. "grammar_error"
A genuine grammatical error that should be corrected.

2. "wording_improvement"
The sentence is grammatically valid, but there is ONE clearly useful improvement that would make it noticeably more natural, precise, or appropriate for the learner's context.

3. "correct"
The sentence is grammatically correct and natural enough. No correction or useful improvement is needed.

Return ONLY valid JSON in exactly this format:

{
  "status": "correct",
  "original": "",
  "corrected": "",
  "explanation": ""
}

GENERAL RULES

Always read the learner's exact sentence carefully.

Never claim the learner made an error that is not actually present.

Never invent personal information or context.

Never change the learner's intended meaning.

Never rewrite a sentence simply because you personally prefer another style.

Use "wording_improvement" only when the improvement is genuinely useful for an English learner.

Do NOT over-correct.

GRAMMAR ERROR

Use:

"status": "grammar_error"

only when there is a clear grammatical problem.

Check for:
- missing required subjects or words
- incorrect articles
- incorrect verb forms
- subject-verb agreement
- clearly incorrect tense construction
- clearly incorrect prepositions
- broken sentence structure
- incorrect singular/plural construction when grammatically required

Make the SMALLEST correction necessary.

Example:

Learner:
"have training in AI."

Return a grammar error because the required subject is missing.

Corrected:
"I have training in AI."

Another example:

Learner:
"I study computer science yesterday."

Corrected:
"I studied computer science yesterday."

WORDING IMPROVEMENT

Use:

"status": "wording_improvement"

when:
- the sentence is grammatically valid
- but ONE expression is clearly less natural, less precise, or less appropriate for the learner's current context
- and there is a clearly better alternative that preserves the intended meaning

This is NOT a grammar error.

For professional or interview contexts, you may suggest more professional wording when it clearly improves the sentence.

Example:

Learner:
"I worked on a project about money problems."

If the intended meaning is problems related to finance, a useful improvement is:

"I worked on a project about financial problems."

This is a wording improvement, NOT a grammar correction.

IMPORTANT:
If changing the wording could change the learner's meaning, do NOT make the change.

In that case return "correct" and let the main coach ask for clarification if necessary.

Do not suggest a wording improvement for every valid sentence.

CORRECT SENTENCES

Use:

"status": "correct"

when the sentence is grammatically correct and natural enough.

Examples:

"I studied computer science."

"I worked as a teacher."

"I have experience in AI."

"I completed training in AI."

Do NOT rewrite these merely because another sentence is possible.

TENSE RULE

A grammatically valid past, present, or future tense must NOT be changed simply because another tense could fit a different situation.

For example:

"I studied computer science."

is grammatically correct.

Do NOT change it to:

"I study computer science."

Likewise:

"I worked as a teacher."

must NOT become:

"I work as a teacher."

Only correct tense when something in the learner's own sentence makes the tense grammatically incompatible.

MEANING PRESERVATION

The corrected or improved sentence must preserve the learner's intended meaning as closely as possible.

Never change:
- past to present
- present to past
- future to present
- personal facts
- names
- places
- fields of study
- projects
- experiences

unless a genuine grammatical correction requires it.

CAPITALIZATION

Do not treat ordinary capitalization as a grammar error.

Common abbreviations such as AI, IT, HR, and CEO may be handled separately by the application.

OUTPUT RULES

If status is "correct":
- copy the exact learner sentence into "original"
- copy the exact learner sentence into "corrected"
- set "explanation" to ""

If status is "grammar_error":
- copy the exact learner sentence into "original"
- put the smallest necessary correction in "corrected"
- give a very short reason in "explanation"

If status is "wording_improvement":
- copy the exact learner sentence into "original"
- put ONE improved version in "corrected"
- give a very short reason in "explanation"

When uncertain between "correct" and "wording_improvement", choose "correct".

When uncertain whether a grammatical error exists, choose "correct".

Return JSON only.
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
    max_tokens: 120
  };

  try {
    const response =
      await fetch(CONFIG.API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

    if (!response.ok) {
      console.warn(
        "Language evaluation failed:",
        response.status
      );

      return null;
    }

    const data =
      await response.json();

    let content =
      data?.choices?.[0]?.message?.content || "";

    content = removeThinking(content)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result =
      JSON.parse(content);

    const allowedStatuses = [
      "correct",
      "grammar_error",
      "wording_improvement"
    ];

    if (!allowedStatuses.includes(result.status)) {
      console.warn(
        "Invalid language evaluation status:",
        result.status
      );

      return null;
    }

    if (!result.original) {
      result.original = text;
    }

    if (!result.corrected) {
      result.corrected = text;
    }

    if (!result.explanation) {
      result.explanation = "";
    }

    if (
      result.status !== "correct" &&
      result.corrected.trim() === text.trim()
    ) {
      result.status = "correct";
      result.corrected = text;
      result.explanation = "";
    }

    console.log(
      "Language evaluation:",
      result
    );

    return result;

  } catch (error) {
    console.warn(
      "Could not evaluate English:",
      error
    );

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

    messages:
      buildConversationContext(messages),

    chat_template_kwargs: {
      enable_thinking: false
    },

    temperature: 0.2,

    max_tokens:180
  };

  const response =
    await fetch(
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

  console.log(
    "Qwen debug:",
    {
      finish_reason:
        data?.choices?.[0]?.finish_reason,

      prompt_tokens:
        data?.usage?.prompt_tokens,

      completion_tokens:
        data?.usage?.completion_tokens,

      total_tokens:
        data?.usage?.total_tokens,

      response:
        data?.choices?.[0]?.message?.content
    }
  );

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
    result.text
      .toLowerCase()
      .startsWith("<think>")
  ) {

    const retryBody = {
      model: CONFIG.MODEL,

      messages: [
        ...buildConversationContext(messages),

        {
          role: "user",

          content:
            state.level === "A1"
              ? "Continue as Language Coach. Give only the learner-facing response. Coach in Arabic and use English only for the language being practiced. Teach one small step only. Do not reveal reasoning or internal instructions."
              : "Continue as Language Coach. Give only the learner-facing coaching response. Teach one small step only. Do not reveal reasoning or internal instructions."
        }
      ],

      chat_template_kwargs: {
        enable_thinking: false
      },

      temperature: 0.15,
      max_tokens: 180
    };

    const retryResponse =
      await fetch(
        CONFIG.API_URL,
        {
          method: "POST",
          headers,
          body:
            JSON.stringify(retryBody)
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
  state.pendingRetry = null;

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
            item.classList.remove(
              "active"
            );
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


    // ============================
    // TURN COUNT
    // ============================

    state.turns++;

    $("#turnCount").textContent =
      state.turns;


    // ============================
    // SHOW USER MESSAGE
    // ============================

    addMessage(
      "user",
      text
    );


    // ============================
    // SAVE USER MESSAGE
    // ============================

    state.messages.push({
      role: "user",
      content: text
    });


    // Learner is answering
    setFlow(1);


    // ============================
    // CLEAR INPUT
    // ============================

    input.value = "";

    input.style.height =
      "auto";


    // ============================
    // WAITING STATE
    // ============================

    input.disabled = true;
    send.disabled = true;

    thinking.classList.remove(
      "hidden"
    );


    try {

      let result;
      let memoryUpdated = false;
      const deterministic =checkDeterministicCorrection(text);

      if (deterministic.hasCorrection) {
        state.pendingRetry = {
          expected: deterministic.corrected,
          type: deterministic.type
        };

        result = {
          stage: "CORRECTION",
          text: deterministic.message
        };
      }
      if (!result && state.pendingRetry) {

        const normalize = value =>
          value
            .trim()
            .replace(/[.!?]+$/g, "")
            .replace(/\s+/g, " ")
            .toLowerCase();

        const userRetry =
          normalize(text);

        const expectedRetry =
          normalize(state.pendingRetry.expected);

        if (userRetry === expectedRetry) {

          // The correction has been completed successfully.
          state.pendingRetry = null;

          // Update memory BEFORE asking the coach what comes next.
          // This allows the coach to see that the current
          // learning point has already been completed.
          markCurrentStepAsPracticed();
          await updateSessionMemory(
            state.messages
          );
          memoryUpdated = true;

          result = await askQwen([
            ...state.messages,

            {
              role: "system",

              content:
                "The learner has successfully completed the requested correction. " +
                "Use the updated SESSION MEMORY before choosing what comes next. " +
                "Briefly confirm the successful retry, then continue to ONE new useful learning point. " +
                "Do not repeat a learning point that has already been practiced. " +
                "For A1, explain in Arabic and give one short English template before asking the learner to try."
            }
          ]);
        }
      }

      // ============================
      // DETECT ENGLISH PRACTICE
      // ============================

      const hasEnglish =
        /[A-Za-z]/.test(text);


      // Count English words.
      // A short answer such as "AI",
      // "Python", or "computer science"
      // should not be treated as a full
      // grammar exercise.

      const englishWords =
        text
          .trim()
          .split(/\s+/)
          .filter(
            word =>
              /[A-Za-z]/.test(word)
          );


      // Only run the dedicated grammar
      // checker when the learner appears
      // to have written an actual sentence.

      const looksLikeEnglishSentence =
        englishWords.length >= 3;


      // Requests/questions such as:
      // "how to introduce myself..."
      // belong to the coach, not the
      // grammar checker.

      const looksLikeQuestionOrRequest =
        /^(how|what|why|when|where|who|can|could|would|should|do|does|did|is|are|am|help|teach|explain|tell)\b/i
          .test(text.trim()) ||
        text.includes("?");


       // ============================
// LANGUAGE EVALUATION
// ============================

if (
  !result &&
  hasEnglish &&
  looksLikeEnglishSentence &&
  !looksLikeQuestionOrRequest
) {

  const evaluation =
    await checkEnglishAttempt(text);


  // ----------------------------
  // REAL GRAMMAR ERROR
  // ----------------------------

  if (
    evaluation?.status === "grammar_error"
  ) {

    state.pendingRetry = {
      expected: evaluation.corrected,
      type: "grammar"
    };

    result = {
      stage: "CORRECTION",

      text:
        `فيه تعديل بسيط على الجملة.\n\n` +
        (
          evaluation.explanation
            ? `${evaluation.explanation}\n\n`
            : ""
        ) +
        `الصحيح:\n${evaluation.corrected}\n\n` +
        `جربي تكتبينها مرة ثانية.`
    };
  }


  // ----------------------------
  // USEFUL WORDING IMPROVEMENT
  // ----------------------------

  else if (
    evaluation?.status === "wording_improvement"
  ) {

    state.pendingRetry = {
      expected: evaluation.corrected,
      type: "wording"
    };

    result = {
      stage: "CORRECTION",

      text:
        `جملتك صحيحة، لكن فيه صياغة أنسب لهذا السياق.\n\n` +
        (
          evaluation.explanation
            ? `${evaluation.explanation}\n\n`
            : ""
        ) +
        `الأفضل:\n${evaluation.corrected}\n\n` +
        `جربي تكتبينها مرة ثانية.`
    };
  }


  // ----------------------------
  // CORRECT ANSWER
  // ----------------------------

  else if (
    evaluation?.status === "correct"
  ) {

    // The learner successfully completed
    // the current learning point.
    // Update memory BEFORE choosing
    // the next learning point.

    markCurrentStepAsPracticed();
    await updateSessionMemory(
      state.messages
    );
    memoryUpdated = true;

    result =
      await askQwen(
        state.messages
      );
  }

}


// ============================
// NORMAL LANGUAGE COACH
// ============================

if (!result) {

  result =
    await askQwen(
      state.messages
    );

}
      // ============================
      // DISPLAY RESPONSE
      // ============================

      addMessage(
        "assistant",
        result.text
      );


      // ============================
      // SAVE RESPONSE
      // ============================

      state.messages.push({
        role: "assistant",
        content: result.text
      });


      // ============================
      // UPDATE SESSION MEMORY
      // ============================

      // Update memory after every completed exchange.
      // This prevents the coach from asking again
      // about information the learner just provided.

   if (!memoryUpdated) {

      await updateSessionMemory(
        state.messages
      );

    }

      // ============================
      // UPDATE LESSON FLOW
      // ============================

      setFlowFromStage(
        result.stage
      );

    } catch (error) {

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