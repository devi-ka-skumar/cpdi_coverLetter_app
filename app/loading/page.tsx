export default function LoadingPage() {
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

        {/* Indeterminate progress bar — duration is unknown until the AI is connected */}
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