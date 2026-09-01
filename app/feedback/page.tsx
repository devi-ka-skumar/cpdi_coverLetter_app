"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCoverLetterContext } from "../context/CoverLetterContext";
import MoreServicesButton from "../components/moreServicesButton";
import ErrorModal from "../components/errorModal";
import FeedbackTab from "../components/feedbackTab";
import { getRemainingAttempts } from "../../lib/rateLimiter";

export default function FeedbackPage() {
  const { analysisResult, analysisError } = useCoverLetterContext();
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    setRemaining(getRemainingAttempts());
  }, []);

  // Determine which (if any) error modal to show, without early-returning
  // out of the whole page. The normal page shell below still renders —
  // the modal overlays on top of it, matching disclaimerModal/
  // moreServicesModal's pattern instead of swapping the page out entirely.
  let errorModal: React.ReactNode = null;

  if (!analysisResult && !analysisError) {
    // Someone landed here directly (refresh, typed URL) without going
    // through input -> loading first.
    errorModal = (
      <ErrorModal
        title="No results to show yet"
        message="Looks like you navigated here directly. Head back to submit your cover letter for feedback."
        buttonText="Go to Cover Letter Optimizer"
        buttonHref="/optimize"
      />
    );
  } else if (analysisError) {
    errorModal = (
      <ErrorModal
        title="Something went wrong"
        message={analysisError}
        buttonText="Try Again"
        buttonHref="/optimize"
      />
    );
  } else if (analysisResult?.hasCoverLetterDraft === false) {
    errorModal = (
      <ErrorModal
        title={analysisResult.message || "Upload your cover letter draft to get graded!"}
        message="We didn't detect a cover letter draft in what was submitted."
        buttonText="Go to Cover Letter Optimizer"
        buttonHref="/optimize"
      />
    );
  } else if (analysisResult?.invalidJobDescription === true) {
    errorModal = (
      <ErrorModal
        title="Invalid job description"
        message={
          analysisResult.message ||
          "This doesn't look like a real job description. Please paste the actual job posting to get accurate feedback."
        }
        buttonText="Go to Cover Letter Optimizer"
        buttonHref="/optimize"
      />
    );
  }

  const r = analysisResult;
  const hasValidResult =
    r && r.hasCoverLetterDraft !== false && r.invalidJobDescription !== true;

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      {errorModal}

      {/* Top nav row with centered logo */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex justify-self-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🏠 Home
          </Link>
          {hasValidResult && (
            <Link
              href="/optimize"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
            >
              ✏️ Edit Your Responses
            </Link>
          )}
        </div>
        <div className="justify-self-center">
          <Image
            src="/cpdi-logo.png"
            alt="CCNY Career & Professional Development Institute logo"
            width={340}
            height={101}
            priority
          />
        </div>
        <div className="flex justify-self-end gap-3">
          {hasValidResult && <MoreServicesButton />}
          <a
            href="https://ccny-csm.symplicity.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            🔗 Career Connections
          </a>
        </div>
      </div>

      {hasValidResult && <FeedbackTab />}

      <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#1A1523]">
        Your Results
      </h1>

      {hasValidResult && r && (
        <>
          <p className="mt-1 text-sm text-[#9B96A8]">
            {remaining} of 5 tries remaining today
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Cover Letter Strategy */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1523]">
                Cover Letter Strategy
              </h2>
              <p className="mt-1 text-sm text-[#9B96A8]">
                Based on your resume and the job description — here's how to
                build your next draft.
              </p>

              <p className="mt-6 text-xs font-bold tracking-wide text-[#2F9E5B]">
                ALREADY ON YOUR RESUME — HIGHLIGHT THESE 3 THINGS
              </p>
              <div className="mt-3 rounded-xl bg-[#EAF7EE] p-4">
                <ol className="space-y-3">
                  {r.strategy?.highlights.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#1A1523]">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white text-xs font-bold text-[#2F9E5B]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="mt-6 text-xs font-bold tracking-wide text-[#B4711F]">
                WHAT YOUR LETTER IS MISSING
              </p>
              <p className="mt-1 text-xs text-[#9B96A8]">
                Based on the job posting — add these to strengthen your match:
              </p>
              <div className="mt-3 space-y-3">
                {r.strategy?.addressTheseGaps.map((item, i) => (
                  <div key={i} className="rounded-xl bg-[#FBF0E3] p-4">
                    <p className="text-sm text-[#1A1523]">{item.gap}</p>
                    <p className="mt-1 text-sm text-[#9B96A8]">↓</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1523]">
                      {item.fix}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
                SUGGESTED BLUEPRINT FOR YOUR NEXT DRAFT
              </p>
              <div className="mt-3 space-y-2 rounded-xl bg-[#F3EFFC] p-4 text-sm">
                <BlueprintRow
                  label="Tone"
                  value={r.strategy?.blueprint.tone ?? ""}
                />
                <BlueprintRow
                  label="Opening"
                  value={r.strategy?.blueprint.opening ?? ""}
                />
                <BlueprintRow
                  label="Focus"
                  value={r.strategy?.blueprint.focus ?? ""}
                />
              </div>

              <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
                DON'T FORGET
              </p>
              <ul className="mt-3 space-y-1.5">
                {r.strategy?.mustHaves.map((item, i) => (
                  <li key={i} className="text-sm text-[#1A1523]">
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Grade My Cover Letter */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1523]">
                Grade My Cover Letter
              </h2>
              <p className="mt-1 text-sm text-[#9B96A8]">
                How the draft you submitted actually reads, line by line.
              </p>

              <ScoreRing score={r.score ?? 0} />

              {r.categoryScores && (
                <div className="mt-6 space-y-2">
                  <CategoryRow
                    label="Job Match"
                    score={r.categoryScores.jobMatch}
                    max={25}
                  />
                  <CategoryRow
                    label="Resume Alignment"
                    score={r.categoryScores.resumeAlignment}
                    max={20}
                  />
                  <CategoryRow
                    label="Template Structure"
                    score={r.categoryScores.templateStructure}
                    max={20}
                  />
                  <CategoryRow
                    label="Clarity, Grammar & Impact"
                    score={r.categoryScores.clarityGrammarImpact}
                    max={20}
                  />
                  <CategoryRow
                    label="Professional Tone"
                    score={r.categoryScores.professionalTone}
                    max={15}
                  />
                </div>
              )}

              {r.aiLikelihood &&
                r.aiLikelihood.level !== "Low" &&
                r.aiLikelihood.note && (
                  <div className="mt-4 rounded-xl bg-[#FBF0E3] p-4">
                    <p className="text-xs font-bold tracking-wide text-[#B4711F]">
                      🤖 AI WRITING LIKELIHOOD: {r.aiLikelihood.level.toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm text-[#1A1523]">
                      {r.aiLikelihood.note}
                    </p>
                  </div>
                )}

              <div className="mt-6 rounded-xl bg-[#EAF7EE] p-4">
                <p className="text-xs font-bold tracking-wide text-[#2F9E5B]">
                  KEEP DOING THIS
                </p>
                <p className="mt-2 text-sm text-[#1A1523]">
                  {r.grade?.keepDoingThis.map((item, i) => (
                    <span key={i}>
                      ✓ {item}
                      {i < (r.grade?.keepDoingThis.length ?? 0) - 1 && " · "}
                    </span>
                  ))}
                </p>
              </div>

              <p className="mt-4 text-xs font-bold tracking-wide text-[#B4711F]">
                FIX IMMEDIATELY
              </p>
              <p className="mt-1 text-xs text-[#9B96A8]">
                Specific problems found in the letter you submitted:
              </p>
              <div className="mt-3 space-y-3">
                {r.grade?.fixImmediately.map((item, i) => (
                  <div key={i} className="rounded-xl bg-[#FBF0E3] p-4">
                    <p className="text-sm text-[#1A1523]">{item.problem}</p>
                    <p className="mt-1 text-sm text-[#9B96A8]">→</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1523]">
                      {item.fix}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs font-bold tracking-wide text-[#9B96A8]">
                SPELLING & GRAMMAR
              </p>
              {r.grade?.spellingGrammar.length ? (
                <div className="mt-3 space-y-1.5">
                  {r.grade.spellingGrammar.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1523]">
                      <span className="text-[#B4711F] line-through">
                        {item.incorrect}
                      </span>{" "}
                      → <span className="font-bold">{item.correction}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#2F9E5B]">
                  ✓ No spelling or grammar errors found.
                </p>
              )}

              <p className="mt-6 text-xs font-bold tracking-wide text-[#9B96A8]">
                TEMPLATE SCORE
              </p>
              <div className="mt-3 space-y-2">
                {r.grade?.templateScore.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm text-[#1A1523]"
                  >
                    <span>{item.label}</span>
                    {item.met ? (
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 border-[#2F9E5B] bg-white text-base font-bold text-[#2F9E5B]">
                        ✓
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 border-[#1A1523] bg-white" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-[#F3EFFC] p-4">
                <p className="text-xs font-bold tracking-wide text-[#7C5CDB]">
                  DO THIS NOW
                </p>
                <p className="mt-2 text-sm font-bold text-[#1A1523]">
                  {r.grade?.doThisNow}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
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

function CategoryRow({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#5B5468]">{label}</span>
      <span className="font-bold text-[#1A1523]">
        {score}/{max}
      </span>
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