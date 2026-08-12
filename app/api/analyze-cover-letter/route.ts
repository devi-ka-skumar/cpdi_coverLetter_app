import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { extractTextFromFile } from "../../../lib/extractText";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
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

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze cover letter" },
      { status: 500 }
    );
  }
}