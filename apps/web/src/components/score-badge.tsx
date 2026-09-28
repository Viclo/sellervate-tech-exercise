import { SCORE_CLASSES, scoreLabel } from "@/lib/reviews/scores";

export function ScoreBadge({ score, size = "md" }: { score: number; size?: "md" | "lg" }) {
  const dimensions = size === "lg" ? "size-10 text-lead" : "size-7 text-caption";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dimensions} ${SCORE_CLASSES[score] ?? ""}`}
      title={scoreLabel(score)}
      aria-label={`Score ${score} of 5: ${scoreLabel(score)}`}
    >
      {score}
    </span>
  );
}
