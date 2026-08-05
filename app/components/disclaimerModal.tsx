"use client";

import { useEffect, useState } from "react";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const alreadyAgreed = sessionStorage.getItem("cpdi-disclaimer-agreed");
    if (!alreadyAgreed) {
      setIsOpen(true);
    }
  }, []);

  function handleAgree() {
    sessionStorage.setItem("cpdi-disclaimer-agreed", "true");
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-[#1A1523]">
          Before you get started
        </h2>

        <ul className="mt-6 space-y-4 text-left text-base leading-relaxed text-[#5B5468]">
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              Always submit a cover letter to the jobs or internships
              you&apos;re applying to, unless the listing specifically tells
              you not to.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#7C5CDB]">•</span>
            <span>
              This tool is designed to help you improve a cover letter
              you&apos;ve already written — it is not meant to write one for
              you from scratch.
            </span>
          </li>
        </ul>

        <button
          type="button"
          onClick={handleAgree}
          className="mt-8 w-full rounded-full bg-[#7C5CDB] px-6 py-4 text-base font-bold text-white transition hover:bg-[#6B4CC7]"
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}