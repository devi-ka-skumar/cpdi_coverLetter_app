import { NextResponse } from "next/server";
import { Resend } from "resend";

let resend: Resend | null = null;
function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const SMILEY_LABELS: Record<number, string> = {
  1: "Very unhappy",
  2: "Unhappy",
  3: "Neutral",
  4: "Happy",
  5: "Very happy",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "A rating between 1 and 5 is required." },
        { status: 400 }
      );
    }

    const label = SMILEY_LABELS[rating] ?? "Unknown";

    await getResendClient().emails.send({
      from: "CPDI Cover Letter Optimizer <onboarding@resend.dev>",
      to: process.env.CPDI_FEEDBACK_EMAIL!,
      subject: `App Feedback — ${label} (${rating}/5)`,
      html: `
        <h2>Student App Feedback</h2>
        <p><strong>Rating:</strong> ${rating}/5 (${label})</p>
        ${
          comment
            ? `<p><strong>Comment:</strong></p><p style="white-space: pre-wrap;">${escapeHtml(
                comment
              )}</p>`
            : `<p><em>No written comment submitted.</em></p>`
        }
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send app feedback email:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your feedback." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}