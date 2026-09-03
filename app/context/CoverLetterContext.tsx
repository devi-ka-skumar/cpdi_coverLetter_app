"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AnalysisResult = {
  hasCoverLetterDraft: boolean;
  invalidJobDescription?: boolean;
  message?: string; // only present when hasCoverLetterDraft is false
  score?: number;
  categoryScores?: {
    jobMatch: number;
    resumeAlignment: number;
    templateStructure: number;
    clarityGrammarImpact: number;
    professionalTone: number;
  };
  strategy?: {
    highlights: string[];
    addressTheseGaps: { gap: string; fix: string }[];
    blueprint: {
      tone: string;
      opening: string;
      focus: string;
    };
    mustHaves: string[];
  };
  grade?: {
    keepDoingThis: string[];
    fixImmediately: { problem: string; fix: string }[];
    spellingGrammar: { incorrect: string; correction: string }[];
    templateScore: { label: string; met: boolean }[];
    doThisNow: string;
  };
  aiLikelihood?: {
    level: "Low" | "Medium" | "High";
    example: string | null;
    fix: string | null;
  };
  majorGuidance?: {
    detectedMajor: string | null;
    keywords: string[];
    qualities: string[];
    commonRoles: string[];
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