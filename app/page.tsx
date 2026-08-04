import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/cpdi-logo.png"
            alt="CCNY Career & Professional Development Institute logo"
            width={560}
            height={200}
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-[#1A1523] md:text-6xl">
          Get your cover letter
          <br />
          internship-ready in minutes
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-2xl leading-relaxed text-[#5B5468]">
          Paste the job you want, upload your resume and draft, and get a
          grade plus specific, encouraging feedback tailored to that role —
          built for CCNY students.
        </p>

        {/* Steps */}
        <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
          <StepCard
            number={1}
            title="Paste & upload"
            description="Add the job description, your resume, and your draft cover letter."
          />
          <StepCard
            number={2}
            title="We analyze it"
            description="We check tone, structure, and how well it lines up with the role."
          />
          <StepCard
            number={3}
            title="Get your grade & fixes"
            description="A score out of 100, plus a clear strategy for what to improve."
          />
        </div>

        {/* CTA */}
        <a
          href="/optimize"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-8 py-4 text-base font-bold text-white transition hover:bg-[#6B4CC7]"
        >
          Get Started
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </main>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EAE6F5] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE7FB] text-lg font-bold text-[#7C5CDB]">
        {number}
      </div>
      <h3 className="mt-4 text-xl font-bold text-[#1A1523]">{title}</h3>
      <p className="mt-2 text-lg leading-relaxed text-[#5B5468]">
        {description}
      </p>
    </div>
  );
}