"use client";

import Link from "next/link";
import { useCoverLetterContext } from "../context/CoverLetterContext";

export default function FeedbackPage() {
  const { analysisResult, analysisError } = useCoverLetterContext();

  // No result and no error means someone landed here directly (refresh,
  // typed URL) without going through input -> loading first.
  if (!analysisResult && !analysisError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#1A1523]">
            No results to show yet
          </h1>
          <p className="mt-3 text-base text-[#5B5468]">
            Looks like you navigated here directly. Head back to submit your
            cover letter for feedback.
          </p>
          <Link
            href="/optimize"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-6 py-3 text-sm font-bold text-white"
          >
            Go to Cover Letter Optimizer
          </Link>
        </div>
      </main>
    );
  }

  if (analysisError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#1A1523]">
            Something went wrong
          </h1>
          <p className="mt-3 text-base text-[#5B5468]">{analysisError}</p>
          <Link
            href="/optimize"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-6 py-3 text-sm font-bold text-white"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  const r = analysisResult!;

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

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Cover Letter Strategy */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1523]">
            Cover Letter Strategy
          </h2>

          <p className="mt-4 text-sm text-[#5B5468]">
            {r.strategy.whatsWorking}
          </p>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
            ADDRESS THESE GAPS
          </p>
          <div className="mt-3 space-y-3">
            {r.strategy.addressTheseGaps.map((item, i) => (
              <div key={i} className="rounded-xl bg-[#F3EFFC] p-4">
                <p className="text-sm text-[#5B5468]">{item.gap}</p>
                <p className="mt-1 text-sm text-[#9B96A8]">↓</p>
                <p className="mt-1 text-sm font-bold text-[#1A1523]">
                  {item.fix}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
            COVER LETTER BLUEPRINT
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <BlueprintRow label="Tone" value={r.strategy.blueprint.tone} />
            <BlueprintRow
              label="Opening"
              value={r.strategy.blueprint.suggestedOpening}
            />
            <BlueprintRow label="Focus" value={r.strategy.blueprint.focus} />
          </div>
        </div>

        {/* Grade My Cover Letter */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1523]">
            Grade My Cover Letter
          </h2>

          <ScoreRing score={r.score} />

          <div className="mt-6 rounded-xl bg-[#EAF7EE] p-4">
            <p className="text-xs font-bold tracking-wide text-[#2F9E5B]">
              KEEP DOING THIS
            </p>
            <p className="mt-2 text-sm text-[#1A1523]">
              {r.grade.keepDoingThis.map((item, i) => (
                <span key={i}>
                  ✓ {item}
                  {i < r.grade.keepDoingThis.length - 1 && " · "}
                </span>
              ))}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold tracking-wide text-[#B4711F]">
              FIX IMMEDIATELY
            </p>
            {r.grade.fixImmediately.map((item, i) => (
              <div key={i} className="rounded-xl bg-[#FBF0E3] p-4">
                <p className="text-sm text-[#1A1523]">{item.problem}</p>
                <p className="mt-1 text-sm text-[#9B96A8]">→</p>
                <p className="mt-1 text-sm font-bold text-[#1A1523]">
                  {item.fix}
                </p>
              </div>
            ))}
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

function ScoreRing({ score }: { score: number }) {
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
    </div>
  );
}