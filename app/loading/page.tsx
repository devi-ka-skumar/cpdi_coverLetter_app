"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCoverLetterContext } from "../context/CoverLetterContext";

export default function LoadingPage() {
  const router = useRouter();
  const {
    jobDescription,
    resumeFile,
    coverLetterFile,
    setAnalysisResult,
    setAnalysisError,
  } = useCoverLetterContext();

  useEffect(() => {
    // If someone lands here directly without going through the input page,
    // there's nothing to analyze — send them back rather than calling the
    // API with empty data.
    if (!jobDescription || !resumeFile || !coverLetterFile) {
      router.push("/optimize");
      return;
    }

    let cancelled = false;

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

        if (cancelled) return;

        if (!res.ok) {
          setAnalysisError(data.error || "Something went wrong. Please try again.");
          setAnalysisResult(null);
        } else {
          setAnalysisResult(data);
          setAnalysisError(null);
        }

        router.push("/feedback");
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to analyze cover letter:", err);
        setAnalysisError("Something went wrong. Please try again.");
        setAnalysisResult(null);
        router.push("/feedback");
      }
    }

    analyze();

    return () => {
      cancelled = true;
    };
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
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#7C5CDB]" />
        </div>

        <div className="mt-8 rounded-xl bg-[#F3EFFC] px-4 py-3 text-sm text-[#5B5468]">
          💡 Tip: even strong drafts usually get 2–3 suggestions — that&apos;s
          completely normal.
        </div>
      </div>
    </main>
  );
}