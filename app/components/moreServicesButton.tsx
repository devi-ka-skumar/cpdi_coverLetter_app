"use client";

import { useState } from "react";
import MoreServicesModal from "./moreServicesModal";

export default function MoreServicesButton() {
  const [showMoreServices, setShowMoreServices] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowMoreServices(true)}
        className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#EDE7FB] px-5 py-2.5 text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
      >
        🎓 More Services
      </button>

      {showMoreServices && (
        <MoreServicesModal onClose={() => setShowMoreServices(false)} />
      )}
    </>
  );
}