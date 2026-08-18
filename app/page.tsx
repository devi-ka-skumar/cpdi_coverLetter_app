import Image from "next/image";
import DisclaimerModal from "./components/disclaimerModal";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-8 md:py-10">
      <DisclaimerModal />
      <div className="mx-auto max-w-4xl text-center">
        {/* Career Connections link */}
        <div className="flex justify-center">
          <a
            href="https://ccny-csm.symplicity.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#EDE7FB] px-4 py-2 text-sm font-bold text-[#7C5CDB]"
          >
            🔗 Career Connections
          </a>
        </div>

        {/* Logo */}
        <div className="mt-6 flex flex-col items-center">
          <Image
            src="/cpdi-logo.png"
            alt="CCNY Career & Professional Development Institute logo"
            width={440}
            height={155}
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#1A1523] md:text-6xl">
          Get your cover letter
          <br />
          internship and job ready in minutes
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-4 max-w-2xl text-2xl leading-relaxed text-[#5B5468]">
          Paste the job description, upload your resume and cover letter
          draft, and receive a grade along with specific, encouraging
          feedback tailored to the role—all designed with CCNY students in
          mind.
        </p>

        {/* Steps */}
        <div className="mt-8 grid gap-6 text-left md:grid-cols-3">
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
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-12 py-7 text-xl font-bold text-white transition hover:bg-[#6B4CC7]"
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