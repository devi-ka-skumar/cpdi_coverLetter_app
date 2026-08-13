"use client";

export default function MoreServicesModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A1523]">
              More Ways CPDI Can Help
            </h2>
            <p className="mt-1 text-sm text-[#5B5468]">
              From Here to Hired — support from freshman year through
              graduation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-4 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EDE7FB] text-lg font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
          >
            ×
          </button>
        </div>

        {/* Career Resources */}
        <div className="mt-6 rounded-xl bg-[#F3EFFC] p-5">
          <p className="text-xs font-bold tracking-wide text-[#7C5CDB]">
            CAREER RESOURCES
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[#1A1523]">
            <li>✓ Resume and Cover Letter Critiques/Writing</li>
            <li>✓ Job/Internship Search Strategies</li>
            <li>✓ Interview Prep</li>
            <li>✓ Deciding on a Major</li>
            <li>✓ Exploring Careers</li>
            <li>✓ Grad School Application Reviews, and more!</li>
            <li>✓ Workshops, Career Fairs & Events</li>
            <li>✓ Exclusive Job Board for CCNY Students</li>
          </ul>
        </div>

        {/* Programs */}
        <p className="mt-6 text-xs font-bold tracking-wide text-[#7C5CDB]">
          PROGRAMS
        </p>
        <div className="mt-3 space-y-3">
          <ProgramCard
            title="Explorer Program"
            audience="For freshmen & sophomores still exploring options"
            description="Pairs you with a career coach to connect your interests and strengths with possible majors and career paths."
          />
          <ProgramCard
            title="CPDI Internship Program"
            audience="For students with 24+ credits, or freshmen seeking summer internships"
            description="Get your resume submitted to CPDI's employer network, personalized internship referrals, and a letter of recommendation upon completion."
          />
          <ProgramCard
            title="CPDI Senior Recruitment Program"
            audience="For students graduating this year or within the past 6 months"
            description="Strengthen your resume, cover letter, and LinkedIn, build interview skills, and get referred directly to employers hiring now."
          />
        </div>

        {/* CTA */}
        <div className="mt-6 rounded-xl bg-[#7C5CDB] p-5 text-center">
          <p className="text-sm font-bold text-white">
            Ready to get started?
          </p>
          <p className="mt-1 text-sm text-[#EDE7FB]">
            Register for a program or book a coaching appointment on Career
            Connections.
          </p>
          <a
            href="https://ccny-csm.symplicity.com/students/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#7C5CDB] transition hover:bg-[#F3EFFC]"
          >
            Visit Career Connections
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Contact footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#9B96A8]">
          <span>📞 212-650-5327</span>
          <span>✉️ cpdi@ccny.cuny.edu</span>
          <span>📷 @ccnycareers</span>
          <span>📍 North Academic Center, Room 1/116</span>
        </div>
      </div>
    </div>
  );
}

function ProgramCard({
  title,
  audience,
  description,
}: {
  title: string;
  audience: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#EAE6F5] p-4">
      <p className="text-sm font-bold text-[#1A1523]">{title}</p>
      <p className="mt-0.5 text-xs italic text-[#9B96A8]">{audience}</p>
      <p className="mt-2 text-sm text-[#5B5468]">{description}</p>
    </div>
  );
}