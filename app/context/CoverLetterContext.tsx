"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AnalysisResult = {
  score: number;
  strategy: {
    whatsWorking: string;
    addressTheseGaps: { gap: string; fix: string }[];
    blueprint: {
      tone: string;
      suggestedOpening: string;
      focus: string;
    };
  };
  grade: {
    keepDoingThis: string[];
    fixImmediately: { problem: string; fix: string }[];
  };
};

type CoverLetterContextType = {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  coverLetterFile: File | null;
  setCoverLetterFile: (file: File | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  analysisError: string | null;
  setAnalysisError: (error: string | null) => void;
  lastAnalyzedFingerprint: string | null;
  setLastAnalyzedFingerprint: (fingerprint: string | null) => void;
};

const CoverLetterContext = createContext<CoverLetterContextType | null>(null);

export function CoverLetterProvider({ children }: { children: ReactNode }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalyzedFingerprint, setLastAnalyzedFingerprint] = useState<
    string | null
  >(null);

  return (
    <CoverLetterContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        resumeFile,
        setResumeFile,
        coverLetterFile,
        setCoverLetterFile,
        analysisResult,
        setAnalysisResult,
        analysisError,
        setAnalysisError,
        lastAnalyzedFingerprint,
        setLastAnalyzedFingerprint,
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