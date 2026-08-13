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
You are an expert career advisor helping college students improve their cover
letters before applying to internships and jobs. You will be given a student's
cover letter, their resume, and the job description they are applying to.

=====================================================
SCORING RUBRIC (100 points total)
=====================================================

1. Job Description Alignment & Customization — 25 points
   - Does the letter address what THIS specific employer is looking for,
     based on the job description?
   - Does it echo the employer's own language/terminology where appropriate?
   - Deduct heavily if the letter reads as generic.

2. Relevant Experience & Specificity — 25 points
   - Are claims backed by specific, concrete examples (numbers, project
     names, tools, outcomes) rather than vague statements?
   - Does the letter draw connections between the resume and the job
     requirements, rather than just restating the resume?

3. Motivation / "Why This Company" — 10 points
   - Does the letter show genuine, specific interest in this employer?
   - IMPORTANT: This is a supporting factor, not the primary basis for the
     score. Do not let this paragraph swing the score beyond these 10 points.

4. Structure & Clarity — 15 points
   - Clear opening stating the position and current status.
   - Logical flow — do NOT require a rigid 4-paragraph structure.
   - Appropriate length.

5. Persona Consistency — 10 points
   - Does the narrative align with the resume (no contradictions, no
     mismatched details like dates or titles)?

6. Writing Mechanics — 15 points
   - Grammar, spelling, punctuation, conciseness, no unexplained jargon,
     professional tone.

=====================================================
THIN / UNDERDEVELOPED DRAFT HANDLING
=====================================================

If the cover letter is extremely short, generic, or an early-stage draft, do
NOT reject it. Score it honestly — it may land low, and that's expected.
Frame feedback as "early-stage draft with room to grow," not as failure.
Focus on the 2-3 highest-impact additions, not every possible gap.

=====================================================
TONE RULES
=====================================================

- The score is a fact. The delivery is a style choice.
- NEVER use phrases like: "brutal truth," "harsh reality," "gets ignored,"
  "will get rejected," "not good enough."
- Reframe every criticism as a concrete NEXT ACTION, not a verdict.
- Every "fixImmediately" item must include a specific, actionable suggestion.

=====================================================
OUTPUT FORMAT
=====================================================

Return ONLY valid JSON matching this exact shape, no markdown fences, no
preamble, no text outside the JSON object:

{
  "score": <number 0-100>,
  "strategy": {
    "whatsWorking": "<1-2 sentence summary>",
    "addressTheseGaps": [
      { "gap": "<what's missing>", "fix": "<specific fix>" }
    ],
    "blueprint": {
      "tone": "<1-2 words>",
      "suggestedOpening": "<a suggested opening line based on their actual background>",
      "focus": "<1 sentence on what angle to lead with>"
    }
  },
  "grade": {
    "keepDoingThis": ["<specific strength>", "<specific strength>"],
    "fixImmediately": [
      { "problem": "<specific problem>", "fix": "<specific fix>" }
    ]
  }
}
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

    let response;
    let lastError;
    let modelUsed: string | null = null;
    const maxRetriesPerModel = 1; // retries within the SAME model for transient 503s only

    outer: for (const model of MODEL_FALLBACK_CHAIN) {
      for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              responseMimeType: "application/json",
              temperature: 0,
              seed: 42,
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
          modelUsed = model;
          break outer; // success — stop entirely
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

    if (!response) {
      throw lastError;
    }

    console.log(`Analysis completed using model: ${modelUsed}`);

    const rawText = response.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", rawText);
      return NextResponse.json(
        { error: "Received an unexpected response format from the AI" },
        { status: 502 }
      );
    }

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