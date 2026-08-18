"use client";

export default function ErrorModal({
  title,
  message,
  buttonText,
  buttonHref,
}: {
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
        <h1 className="text-2xl font-extrabold text-[#1A1523]">{title}</h1>
        <p className="mt-3 text-base text-[#5B5468]">{message}</p>
        <a
          href={buttonHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7C5CDB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#6B4CC7]"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}