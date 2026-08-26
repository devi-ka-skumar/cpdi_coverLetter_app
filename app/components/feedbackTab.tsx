"use client";

import { useState } from "react";

const SMILEYS = [
  { rating: 1, emoji: "😞" },
  { rating: 2, emoji: "🙁" },
  { rating: 3, emoji: "😐" },
  { rating: 4, emoji: "🙂" },
  { rating: 5, emoji: "😄" },
];

export default function FeedbackTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!rating) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit-app-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    // Reset a beat after closing so the panel doesn't visibly reset
    // while the close animation/transition is still happening.
    setTimeout(() => {
      setRating(null);
      setComment("");
      setSubmitted(false);
      setError(null);
    }, 300);
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Give feedback on this tool"
          className="fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-2 rounded-r-2xl bg-[#7C5CDB] px-3 py-5 text-sm font-bold text-white shadow-lg transition hover:bg-[#6B4CC7] hover:px-4"
        >
          <span aria-hidden="true" className="text-base">
            💬
          </span>
          <span className="[writing-mode:vertical-rl] tracking-wide">
            Feedback
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-start bg-black/40 px-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-[#1A1523]">
                {submitted ? "Thank you!" : "How's this tool working for you?"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="ml-4 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#EDE7FB] text-base font-bold text-[#7C5CDB] transition hover:bg-[#D9D2F0]"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <p className="mt-3 text-sm text-[#5B5468]">
                Your feedback helps CPDI make this tool better for other
                students.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-[#5B5468]">
                  Totally optional, but it helps a lot.
                </p>

                <div className="mt-5 flex justify-between">
                  {SMILEYS.map(({ rating: r, emoji }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      aria-label={`Rate ${r} out of 5`}
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
                        rating === r
                          ? "bg-[#7C5CDB] scale-110"
                          : "bg-[#F3EFFC] hover:bg-[#EDE7FB]"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Anything you'd like to share? (optional)"
                  className="mt-5 h-24 w-full resize-none rounded-xl border border-[#EAE6F5] bg-[#FBFAF8] p-3 text-sm text-[#1A1523] placeholder:text-[#9B96A8] focus:outline-none focus:ring-2 focus:ring-[#7C5CDB]"
                />

                {error && (
                  <p className="mt-2 text-sm text-[#B4711F]">{error}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!rating || submitting}
                  className="mt-4 w-full rounded-full bg-[#7C5CDB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#6B4CC7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Sending..." : "Submit Feedback"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}