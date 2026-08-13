const STORAGE_KEY = "cpdi_analyze_attempts";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Client-side, localStorage-based soft rate limit. This is NOT a real
 * security boundary — clearing browser storage, using a different browser,
 * or incognito mode all bypass it trivially. It's a friendly nudge against
 * casual repeated clicking, not protection against determined misuse.
 * A real per-student limit would require server-side persistence tied to
 * an actual student identity, which this app doesn't currently have.
 */

function getAttempts(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: number[] = JSON.parse(raw);
    const cutoff = Date.now() - WINDOW_MS;
    return parsed.filter((timestamp) => timestamp > cutoff);
  } catch {
    return [];
  }
}

function saveAttempts(attempts: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently,
    // just means the limit won't be enforced for this session.
  }
}

export function canAnalyze(): boolean {
  return getAttempts().length < MAX_ATTEMPTS;
}

export function getRemainingAttempts(): number {
  return Math.max(0, MAX_ATTEMPTS - getAttempts().length);
}

export function recordAttempt(): void {
  const attempts = getAttempts();
  attempts.push(Date.now());
  saveAttempts(attempts);
}

/**
 * Returns how long until the oldest attempt ages out of the 24-hour
 * window, in a human-readable form like "2 hours" or "45 minutes".
 */
export function getTimeUntilNextSlot(): string {
  const attempts = getAttempts();
  if (attempts.length === 0) return "";

  const oldest = Math.min(...attempts);
  const resetsAt = oldest + WINDOW_MS;
  const msRemaining = resetsAt - Date.now();

  if (msRemaining <= 0) return "a moment";

  const hours = Math.floor(msRemaining / (60 * 60 * 1000));
  const minutes = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}