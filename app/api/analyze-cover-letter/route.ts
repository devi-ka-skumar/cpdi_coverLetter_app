import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { extractTextFromFile } from "../../../lib/extractText";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Tried in order — if one is rate-limited (429), we fall through to the
// next rather than failing the student's request outright. Each model may
// grade very slightly differently despite identical prompt/temperature/seed,
// which is a known trade-off in exchange for reliability.
//
// Ordered with mainline Flash models first (most similar grading quality
// to each other), then "Lite" models last as a high-capacity safety net —
// Lite models trade some quality for much higher daily quotas (500 RPD
// vs 20 RPD), so they're the last resort rather than the first choice.
//
// Only includes actual text-generation models — image/video/audio/
// embedding/agent/live-conversation models are excluded since they either
// can't do this task or use a different API shape entirely.
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
];

// Dev-only cache so repeated identical test runs don't burn API quota.
// Resets whenever the dev server restarts. Never active in production.
const devCache = new Map<string, any>();

const SYSTEM_PROMPT = `
You are a strict but helpful career coach. You will be given a student's
resume, the job description they are applying to, and (usually) their cover
letter draft. Evaluate the cover letter using the CPDI Cover Letter Guide
below as the required standard.

=====================================================
CPDI COVER LETTER GUIDE (required structure)
=====================================================

1. CANDIDATE AND EMPLOYER INFORMATION
   - Candidate's name and address, date, contact person's name/title,
     company name and address, professional greeting.

2. OPENING PARAGRAPH
   - States the position applied for, how the candidate learned about it,
     and immediately why their background makes them a strong candidate.
     Short, direct, hard-hitting.

3. MATCH-MAKING PARAGRAPH
   - Connects the resume directly to the job description. Summarizes the
     strongest matches rather than listing every requirement.

4. COMPANY-CONNECTION PARAGRAPH
   - Explains specifically why the candidate wants to work for THIS
     employer, connecting to the company's mission/values/work. Never
     invents company information that wasn't provided — if the company's
     mission or values aren't available in the job description, the
     feedback should say to research them, not fabricate them.

5. CLOSING PARAGRAPH
   - Requests an interview, includes contact info when available,
     reaffirms interest, thanks the employer.

6. SIGN-OFF
   - Professional closing, full name.

LENGTH: concise, one page maximum.

=====================================================
IF NO COVER LETTER DRAFT IS PROVIDED
=====================================================

Respond ONLY with this exact JSON:
{ "hasCoverLetterDraft": false, "message": "Upload your cover letter draft to get graded!" }

Do not attempt to grade or provide strategy if there is no draft.

=====================================================
IF THE JOB DESCRIPTION IS MISSING, TOO SHORT, OR NOT A REAL JOB POSTING
=====================================================

If the job description is gibberish, random characters, unrelated to any
real job posting, or too short to represent an actual job (fewer than
roughly 20 words of real content), respond ONLY with this exact JSON:
{ "hasCoverLetterDraft": true, "invalidJobDescription": true, "message": "This doesn't look like a real job description. Please paste the actual job posting to get accurate feedback." }

Do not attempt to score Job Match or any other category against an
invalid job description — a low score on real content is honest
feedback, but a score against fake input is meaningless and misleading.

=====================================================
SCORING RUBRIC (100 points total) — only when a draft IS provided
=====================================================

- Job Match — 25 points
- Resume Alignment — 20 points
- Template Structure — 20 points (per the 4-paragraph guide above)
- Clarity, Spelling, Grammar & Impact — 20 points
- Professional Tone — 15 points

The five category scores must add up correctly to the total score.

=====================================================
GRADING RULES
=====================================================

- Verify claims in the cover letter are actually supported by the resume.
  Penalize invented, exaggerated, or unsupported information.
- Check whether the letter addresses important job requirements.
- Evaluate the letter against all four required paragraphs above.
- Check spelling, grammar, punctuation, capitalization, sentence structure.
  Use American English spelling. Identify the EXACT incorrect word/phrase
  and its correction. Do not flag company names, product names, technical
  terms, or proper nouns unless clearly incorrect.
- Be direct and specific. Never vague ("make it better").
- Do not rewrite the complete cover letter.

=====================================================
TONE RULES — apply at every score level, this is non-negotiable
=====================================================

- The score and the checklist results are facts. The delivery is a style
  choice. A low score or an unmet template item does NOT mean the feedback
  should sound harsh, blunt, or discouraging.
- NEVER use phrases like "brutal truth," "harsh reality," "gets ignored,"
  "will get rejected," "not good enough."
- Reframe every piece of criticism as a concrete NEXT ACTION, not a verdict.
- If the letter doesn't follow the 4-paragraph structure exactly, mark the
  relevant checklist item as unmet, but keep the written feedback
  constructive and specific about what to add or reorganize — not
  punitive about the structural choice itself.
- If the letter is extremely short or an early-stage draft, score it
  honestly (it may land low), but frame feedback as "early-stage draft
  with room to grow," and focus on the 2-3 highest-impact additions rather
  than listing every gap.

=====================================================
MAJOR-SPECIFIC GUIDANCE — only when a draft IS provided
=====================================================

Identify the student's major or field of study from their resume's
education section (degree title, coursework, or program name). This is
separate from the job they're applying to — it's about their academic
background, not the role.

If a major can be confidently identified, provide:
- 4-6 keywords or skills that employers commonly look for from candidates
  in that field, for entry-level roles generally (not just this specific
  job posting)
- 2-3 personal qualities or strengths particularly valued in that field
- 2-3 typical entry-level job titles graduates in that field often pursue

Base this on general, well-established knowledge about the field and its
typical entry-level hiring — do not invent narrow or unusual claims. If
the major cannot be confidently determined from the resume, set
detectedMajor to null and omit keywords/qualities/commonRoles (return
empty arrays for each).

This section is informational context about the student's field in
general — it should never contradict or duplicate the job-specific
strategy already covered above.

=====================================================
OUTPUT FORMAT
=====================================================

Return ONLY valid JSON matching this exact shape, no markdown fences, no
preamble, no text outside the JSON object:

{
  "hasCoverLetterDraft": true,
  "score": <number 0-100>,
  "categoryScores": {
    "jobMatch": <0-25>,
    "resumeAlignment": <0-20>,
    "templateStructure": <0-20>,
    "clarityGrammarImpact": <0-20>,
    "professionalTone": <0-15>
  },
  "strategy": {
    "highlights": ["<strongest match 1>", "<strongest match 2>", "<strongest match 3>"],
    "addressTheseGaps": [
      { "gap": "<important gap>", "fix": "<five-word recommendation>" }
    ],
    "blueprint": {
      "tone": "<one word>",
      "opening": "<one punchy suggested opening sentence>",
      "focus": "<one phrase describing the candidate's central story>"
    },
    "mustHaves": [
      "<specific requirement from the job the letter should mention>",
      "<specific company mission/value to connect to, or 'research the company's stated mission' if not provided>"
    ]
  },
  "grade": {
    "keepDoingThis": ["<specific strong element>", "<another>"],
    "fixImmediately": [
      { "problem": "<specific problem>", "fix": "<exact fix in 10 words or fewer>" }
    ],
    "spellingGrammar": [
      { "incorrect": "<exact incorrect word/phrase>", "correction": "<correction>" }
    ],
    "templateScore": [
      { "label": "Para 1: Position + source + why you", "met": <true/false> },
      { "label": "Para 2: Resume matches job", "met": <true/false> },
      { "label": "Para 3: Why this company", "met": <true/false> },
      { "label": "Para 4: Interview request + contact", "met": <true/false> }
    ],
    "doThisNow": "<one clear, specific immediate action>"
  },
  "majorGuidance": {
    "detectedMajor": "<major name, or null if not confidently determined>",
    "keywords": ["<keyword/skill 1>", "<keyword/skill 2>"],
    "qualities": ["<valued quality 1>", "<valued quality 2>"],
    "commonRoles": ["<typical entry-level title 1>", "<typical entry-level title 2>"]
  }
}

If there are no spelling or grammar errors, return an empty array for
"spellingGrammar", not a placeholder entry.

CRITICAL: Inside any JSON string value, never use straight double-quote
characters to add emphasis or quote a phrase. If you need to quote exact
wording from the letter, use single quotes ' ' instead. A stray double
quote inside a string breaks the JSON and makes your entire response
unusable. Double-check every object and array is closed with the matching
bracket type: objects with "}", arrays with "]".
`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const jobDescription = formData.get("jobDescription") as string | null;
    const resumeFile = formData.get("resumeFile") as File | null;
    const coverLetterFile = formData.get("coverLetterFile") as File | null;

    if (!jobDescription || !resumeFile || !coverLetterFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let resumeText: string;
    let coverLetterText: string;

    try {
      resumeText = await extractTextFromFile(resumeFile);
      coverLetterText = await extractTextFromFile(coverLetterFile);
    } catch (extractErr) {
      console.error("File extraction error:", extractErr);
      return NextResponse.json(
        { error: "Could not read one of the uploaded files. Please check the file format." },
        { status: 400 }
      );
    }

    const cacheKey = `${jobDescription}|${resumeText}|${coverLetterText}`;
    if (process.env.NODE_ENV === "development" && devCache.has(cacheKey)) {
      console.log("Serving cached result (dev mode, no API call made)");
      return NextResponse.json(devCache.get(cacheKey));
    }

    // Parsing now happens INSIDE this loop, alongside generation. A
    // malformed-JSON response is treated the same as a transient overload:
    // retry the same model once, then fall through to the next model in
    // the chain if it keeps happening. The loop only exits successfully
    // once `parsed` is genuinely valid JSON, not just once a response
    // came back.
    let parsed: any = null;
    let lastError: any = null;
    let modelUsed: string | null = null;
    const maxRetriesPerModel = 1;

    outer: for (const model of MODEL_FALLBACK_CHAIN) {
      for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              responseMimeType: "application/json",
              temperature: 0,
              seed: 42,
              maxOutputTokens: 3000,
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}\n\nCOVER LETTER:\n${coverLetterText}`,
                  },
                ],
              },
            ],
          });

          const rawText = response.text ?? "";
          const cleaned = rawText.replace(/```json|```/g, "").trim();

          try {
            parsed = JSON.parse(cleaned);
            modelUsed = model;
            break outer; // success — stop entirely
          } catch (parseErr: any) {
            console.error(
              `Failed to parse response from ${model} (attempt ${attempt}):`,
              parseErr.message
            );
            console.error("Raw response length:", rawText.length);
            console.error("Raw response:", rawText);
            lastError = new Error("Received malformed JSON from the AI");
            if (attempt < maxRetriesPerModel) {
              // Likely a one-off generation glitch — retry same model once.
              continue;
            }
            break; // move to next model in the chain
          }
        } catch (apiErr: any) {
          lastError = apiErr;
          const status = apiErr?.status || apiErr?.error?.status;
          const isRateLimited = status === 429 || status === "RESOURCE_EXHAUSTED";
          const isOverloaded = status === 503 || status === "UNAVAILABLE";

          if (isRateLimited) {
            // This model's quota is exhausted — move to the next model
            // immediately, don't waste a retry on the same one.
            console.warn(`${model} rate-limited, falling back to next model`);
            break;
          }

          if (isOverloaded && attempt < maxRetriesPerModel) {
            // Transient overload — brief backoff, retry same model once.
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          // Non-retryable error, or retries exhausted on this model —
          // still try the next model in the chain rather than giving up.
          break;
        }
      }
    }

    if (!parsed) {
      throw lastError || new Error("Failed to get a valid response from the AI");
    }

    console.log(`Analysis completed using model: ${modelUsed}`);

    if (process.env.NODE_ENV === "development") {
      devCache.set(cacheKey, parsed);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Gemini API error:", err);

    const status = err?.status || err?.error?.status;
    const isOverloaded = status === 503 || status === "UNAVAILABLE";
    const isRateLimited = status === 429 || status === "RESOURCE_EXHAUSTED";

    if (isRateLimited) {
      return NextResponse.json(
        {
          error:
            "We've hit today's testing limit across all available AI models. Please wait about a minute before trying again.",
        },
        { status: 429 }
      );
    }

    if (isOverloaded) {
      return NextResponse.json(
        {
          error:
            "Our AI service is experiencing high demand right now. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze cover letter" },
      { status: 500 }
    );
  }
}