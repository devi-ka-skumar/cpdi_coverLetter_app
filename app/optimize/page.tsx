"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OptimizePage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  function handleAnalyze() {
    // TODO: once the AI is connected, kick off the actual request here
    // and navigate to /loading immediately, then redirect to the results
    // page only once the response comes back — rather than a fixed delay.
    router.push("/loading");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 md:px-16">
      {/* Home link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-[#EDE7FB] px-4 py-2 text-sm font-bold text-[#7C5CDB]"
      >
        🏠 Home
      </Link>

      {/* Header */}
      <div className="mt-6">
        <Image
          src="/cpdi-logo.png"
          alt="CCNY Career & Professional Development Institute logo"
          width={220}
          height={65}
          priority
        />
      </div>

      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#1A1523] md:text-5xl">
        Cover Letter Optimizer for Students
      </h1>
      <p className="mt-3 text-lg text-[#5B5468]">
        Get your cover letter graded and optimized for your dream internship
        or job.
      </p>

      {/* Input cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* Job Description */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1523]">
            Job Description
          </h2>
          <p className="mt-1 text-sm text-[#5B5468]">
            Paste the posting you&apos;re applying to
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={`Paste the job description here — e.g. 'Software Engineering Intern at a fintech startup. Looking for students with experience in React, Node.js, and REST APIs...'`}
            className="mt-4 h-56 w-full resize-none rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-4 text-sm text-[#1A1523] placeholder:text-[#9B96A8] focus:outline-none focus:ring-2 focus:ring-[#7C5CDB]"
          />
        </div>

        {/* Resume upload */}
        <UploadCard
          title="Resume"
          subtitle="So we can cross-check your experience"
          file={resumeFile}
          onFileSelect={setResumeFile}
        />

        {/* Cover Letter Draft upload */}
        <UploadCard
          title="Cover Letter Draft"
          subtitle="Your current draft, even a rough one"
          file={coverLetterFile}
          onFileSelect={setCoverLetterFile}
        />
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!jobDescription || !resumeFile || !coverLetterFile}
          className="inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-8 py-4 text-base font-bold text-white transition hover:bg-[#6B4CC7] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze My Cover Letter
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}

function UploadCard({
  title,
  subtitle,
  file,
  onFileSelect,
}: {
  title: string;
  subtitle: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (fileList && fileList.length > 0) {
      onFileSelect(fileList[0]);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#1A1523]">{title}</h2>
      <p className="mt-1 text-sm text-[#5B5468]">{subtitle}</p>

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#C9E6D3] bg-[#F1FAF4] px-4 py-3">
          <span className="text-lg">📄</span>
          <span className="flex-1 truncate text-sm font-bold text-[#1A1523]">
            {file.name}
          </span>
          <span
            className="text-base text-[#2F9E5B]"
            role="img"
            aria-label="File accepted"
          >
            ✓
          </span>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            aria-label={`Remove ${file.name}`}
            className="text-lg leading-none text-[#9B96A8] transition hover:text-[#5B5468]"
          >
            ×
          </button>
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-3 flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
          isDragging
            ? "border-[#7C5CDB] bg-[#F3EFFC]"
            : "border-[#D9D2F0] bg-[#FBFAF8]"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE7FB] text-[#7C5CDB]">
          ↑
        </div>
        <p className="mt-3 text-sm font-bold text-[#1A1523]">
          {file ? "Upload a different file" : "Drag & drop or click to upload"}
        </p>
        {!file && (
          <p className="mt-1 text-xs text-[#9B96A8]">
            PDF or DOCX, up to 5MB
          </p>
        )}
      </label>
    </div>
  );
}