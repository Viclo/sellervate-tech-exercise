/**
 * Anchored scale: every number means the same thing for every lead and every brand,
 * which is what makes an average comparable across people and over time.
 */
export const SCORES = [
  { value: 1, label: "Would lose the account", short: "Harmful" },
  { value: 2, label: "Needs to be redone", short: "Poor" },
  { value: 3, label: "Acceptable, not on brand", short: "OK" },
  { value: 4, label: "Good, small things to polish", short: "Good" },
  { value: 5, label: "Model reply, use it to teach", short: "Model" },
] as const;

export function scoreLabel(score: number) {
  return SCORES.find((s) => s.value === score)?.label ?? "";
}

/** Static class names so Tailwind can see them. Colour is always paired with the number. */
export const SCORE_CLASSES: Record<number, string> = {
  1: "bg-score-1 text-white",
  2: "bg-score-2 text-white",
  3: "bg-score-3 text-base-content",
  4: "bg-score-4 text-white",
  5: "bg-score-5 text-white",
};

export type Severity = "minor" | "major" | "critical";

export const SEVERITY_CLASSES: Record<Severity, string> = {
  minor: "border-base-300 bg-base-100",
  major: "border-warning/60 bg-warning/10",
  critical: "border-error/50 bg-error/10",
};

export function asSeverity(value: string): Severity {
  return value === "critical" || value === "major" ? value : "minor";
}
