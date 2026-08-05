"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type CoverLetterContextType = {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  coverLetterFile: File | null;
  setCoverLetterFile: (file: File | null) => void;
};

const CoverLetterContext = createContext<CoverLetterContextType | null>(null);

export function CoverLetterProvider({ children }: { children: ReactNode }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  return (
    <CoverLetterContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        resumeFile,
        setResumeFile,
        coverLetterFile,
        setCoverLetterFile,
      }}
    >
      {children}
    </CoverLetterContext.Provider>
  );
}

export function useCoverLetterContext() {
  const context = useContext(CoverLetterContext);
  if (!context) {
    throw new Error(
      "useCoverLetterContext must be used inside a CoverLetterProvider"
    );
  }
  return context;
}