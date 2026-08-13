"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCoverLetterContext } from "../context/CoverLetterContext";

export default function LoadingPage() {
  const router = useRouter();
  const {
    jobDescription,
    resumeFile,
    coverLetterFile,
    analysisResult,
    setAnalysisResult,
    analysisError,
    setAnalysisError,
    lastAnalyzedFingerprint,
    setLastAnalyzedFingerprint,
  } = useCoverLetterContext();

  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const hasStarted = useRef(false); // guards against double-firing in dev/StrictMode or fast re-navigation

  useEffect(() => {
    if (!jobDescription || !resumeFile || !coverLetterFile) {
      router.push("/optimize");
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    // Build a lightweight fingerprint of the current inputs — file name,
    // size, and last-modified time, plus the job description text. This
    // doesn't require re-reading file contents, just enough to detect
    // "these are the exact same files/text as last time."
    const currentFingerprint = `${jobDescription}|${resumeFile.name}-${resumeFile.size}-${resumeFile.lastModified}|${coverLetterFile.name}-${coverLetterFile.size}-${coverLetterFile.lastModified}`;

    // If nothing changed since the last successful analysis, skip the API
    // call entirely and just reuse what's already sitting in context —
    // no server round-trip, no quota used, nothing new retained anywhere.
    if (
      analysisResult &&
      !analysisError &&
      lastAnalyzedFingerprint === currentFingerprint
    ) {
      setProgress(100);
      setTimeout(() => router.push("/feedback"), 300);
      return;
    }

    let cancelled = false;

    // Simulated progress: eases toward 90% over ~12 seconds, never
    // reaching 100% on its own — only the real response completes it.
    const progressInterval = setInterval(() => {
      setElapsedMs((prev) => prev + 300);
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const remaining = 90 - prev;
        const increment = Math.max(remaining * 0.08, 0.5);
        return Math.min(prev + increment, 90);
      });
    }, 300);

    async function analyze() {
      try {
        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        formData.append("resumeFile", resumeFile as File);
        formData.append("coverLetterFile", coverLetterFile as File);

        const res = await fetch("/api/analyze-cover-letter", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        clearInterval(progressInterval);
        setProgress(100);

        if (!res.ok) {
          setAnalysisError(data.error || "Something went wrong. Please try again.");
          setAnalysisResult(null);
        } else {
          setAnalysisResult(data);
          setAnalysisError(null);
          setLastAnalyzedFingerprint(currentFingerprint);
        }

        // brief pause so the user sees the bar complete before navigating
        setTimeout(() => {
          router.push("/feedback");
        }, 400);
      } catch (err) {
        clearInterval(progressInterval);
        console.error("Failed to analyze cover letter:", err);
        setAnalysisError("Something went wrong. Please try again.");
        setAnalysisResult(null);
        router.push("/feedback");
      }
    }

    analyze();

    // Intentionally no cleanup-based cancellation here. The hasStarted
    // ref above already guarantees analyze() only ever runs once per
    // real page visit — adding a cancelled flag tied to cleanup breaks
    // this in React Strict Mode's dev-only double-invoke behavior,
    // since the phantom first cleanup would cancel the one real request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C5CDB]">
          <span className="text-3xl" role="img" aria-label="Bear mascot">
            🐻
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-[#1A1523]">
          Reading through your cover letter...
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5B5468]">
          This usually takes a moment. We&apos;re checking tone, structure,
          and how well it lines up with the job description.
        </p>

        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#EDE7FB]">
          <div
            className={`h-full rounded-full bg-[#7C5CDB] transition-all duration-300 ease-out ${
              progress >= 90 ? "animate-pulse" : ""
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {elapsedMs >= 20000 && (
          <p className="mt-3 text-sm text-[#9B96A8]">
            Almost there — still working behind the scenes, this can take a
            little longer for detailed feedback.
          </p>
        )}

        <div className="mt-8 rounded-xl bg-[#F3EFFC] px-4 py-3 text-sm text-[#5B5468]">
          💡 Tip: even strong drafts usually get 2–3 suggestions — that&apos;s
          completely normal.
        </div>
      </div>
    </main>
  );
}