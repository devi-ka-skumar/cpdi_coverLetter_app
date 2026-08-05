"use client";

import Link from "next/link";

// Placeholder data — this will be replaced by the real AI response once
// api-integration is connected. Kept as one object here so it's obvious
// what shape the real data needs to match later.
const mockResult = {
  role: "Software Engineering Intern",
  company: "Fintech startup",
  score: 78,
  scoreLabel: "Solid draft — a few tweaks from great",
  highlights: [
    "Your React + Node.js project work lines up directly with their stack.",
    "Treasurer of the CS club shows initiative beyond coursework.",
    "CCNY databases coursework maps onto their backend needs.",
  ],
  gapBefore: "\"I am a hardworking and dedicated student.\"",
  gapAfter:
    "\"Built and shipped 3 full-stack projects during CCNY's CS program, including a React app used by 200+ students.\"",
  blueprint: {
    tone: "Confident but warm.",
    opening: "Lead with your capstone project, not your GPA.",
    focus: "Impact and tools, not job duties.",
  },
  keepDoing: ["Strong opening hook", "Good length", "Clear call to action"],
  fixImmediately: [
    "Add a metric to paragraph 2",
    "Name the company in your closing",
  ],
  templateCoverage: [
    { label: "Company name mentioned", status: "pass" as const },
    { label: "Specific role title used", status: "pass" as const },
    { label: "Quantified achievement", status: "partial" as const },
    { label: "Clear call to action", status: "pass" as const },
  ],
  doThisNow:
    "Add one number — a percentage, dollar amount, or count — to paragraph 2.",
};

export default function FeedbackPage() {
  const r = mockResult;

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      {/* Top nav pills */}
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#EDE7FB] px-4 py-2 text-sm font-bold text-[#7C5CDB]"
        >
          🏠 Home
        </Link>
        <Link
          href="/optimize"
          className="inline-flex items-center gap-2 rounded-full bg-[#EDE7FB] px-4 py-2 text-sm font-bold text-[#7C5CDB]"
        >
          ✏️ Edit
        </Link>
      </div>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#1A1523]">
        Your Results
      </h1>
      <p className="mt-1 text-base text-[#9B96A8]">
        {r.role} · {r.company}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Cover Letter Strategy */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1523]">
            Cover Letter Strategy
          </h2>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
            HIGHLIGHT THESE 3 THINGS
          </p>
          <ol className="mt-3 space-y-3">
            {r.highlights.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#1A1523]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#EDE7FB] text-xs font-bold text-[#7C5CDB]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
            ADDRESS THESE GAPS
          </p>
          <div className="mt-3 rounded-xl bg-[#F3EFFC] p-4">
            <p className="text-sm italic text-[#9B96A8]">{r.gapBefore}</p>
            <p className="mt-1 text-sm text-[#9B96A8]">↓</p>
            <p className="mt-1 text-sm font-bold text-[#1A1523]">
              {r.gapAfter}
            </p>
          </div>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
            COVER LETTER BLUEPRINT
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <BlueprintRow label="Tone" value={r.blueprint.tone} />
            <BlueprintRow label="Opening" value={r.blueprint.opening} />
            <BlueprintRow label="Focus" value={r.blueprint.focus} />
          </div>
        </div>

        {/* Grade My Cover Letter */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1523]">
            Grade My Cover Letter
          </h2>

          <ScoreRing score={r.score} label={r.scoreLabel} />

          <div className="mt-6 rounded-xl bg-[#EAF7EE] p-4">
            <p className="text-xs font-bold tracking-wide text-[#2F9E5B]">
              KEEP DOING THIS
            </p>
            <p className="mt-2 text-sm text-[#1A1523]">
              {r.keepDoing.map((item, i) => (
                <span key={i}>
                  ✓ {item}
                  {i < r.keepDoing.length - 1 && " · "}
                </span>
              ))}
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-[#FBF0E3] p-4">
            <p className="text-xs font-bold tracking-wide text-[#B4711F]">
              FIX IMMEDIATELY
            </p>
            <p className="mt-2 text-sm text-[#1A1523]">
              {r.fixImmediately.map((item, i) => (
                <span key={i}>
                  → {item}
                  {i < r.fixImmediately.length - 1 && " · "}
                </span>
              ))}
            </p>
          </div>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#9B96A8]">
            TEMPLATE COVERAGE
          </p>
          <div className="mt-3 space-y-2">
            {r.templateCoverage.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm text-[#1A1523]"
              >
                <span>{item.label}</span>
                {item.status === "pass" ? (
                  <span className="text-[#2F9E5B]">✓</span>
                ) : (
                  <span className="text-[#D68A2C]">△</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-[#F3EFFC] p-4">
            <p className="text-xs font-bold tracking-wide text-[#7C5CDB]">
              DO THIS NOW
            </p>
            <p className="mt-2 text-sm font-bold text-[#1A1523]">
              {r.doThisNow}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function BlueprintRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-16 flex-none font-bold text-[#1A1523]">
        {label}
      </span>
      <span className="text-[#5B5468]">{value}</span>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#EDE7FB"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#7C5CDB"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[#1A1523]">
            {score}
          </span>
          <span className="text-xs text-[#9B96A8]">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-center text-base font-bold text-[#1A1523]">
        {label}
      </p>
    </div>
  );
}