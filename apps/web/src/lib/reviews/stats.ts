const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function average(scores: number[]) {
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export function formatAverage(value: number | null) {
  return value === null ? "–" : value.toFixed(1);
}

/** Buckets reviews into weeks counted back from now: index 0 is the oldest week. */
export function weeklyAverages(reviews: { score: number; created_at: string }[], weeks: number, now = Date.now()) {
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    start: new Date(now - (weeks - i) * WEEK_MS),
    scores: [] as number[],
  }));
  for (const review of reviews) {
    const weeksAgo = Math.floor((now - Date.parse(review.created_at)) / WEEK_MS);
    const bucket = buckets[weeks - 1 - weeksAgo];
    if (bucket) bucket.scores.push(review.score);
  }
  return buckets.map((b) => ({ start: b.start, count: b.scores.length, average: average(b.scores) }));
}

type Tagged = { review_tag_links: { tag: { id: string; label: string; severity: string } | null }[] };

/** Most frequent tags across the given reviews, most common first. */
export function topTags(reviews: Tagged[], limit = 5) {
  const counts = new Map<string, { label: string; severity: string; count: number }>();
  for (const review of reviews) {
    for (const { tag } of review.review_tag_links) {
      if (!tag) continue;
      const entry = counts.get(tag.id) ?? { label: tag.label, severity: tag.severity, count: 0 };
      entry.count += 1;
      counts.set(tag.id, entry);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Average of the last `weeks` weeks against everything before it. */
export function comparePeriods(reviews: { score: number; created_at: string }[], weeks: number, now = Date.now()) {
  const cutoff = now - weeks * WEEK_MS;
  const recent = average(reviews.filter((r) => Date.parse(r.created_at) >= cutoff).map((r) => r.score));
  const before = average(reviews.filter((r) => Date.parse(r.created_at) < cutoff).map((r) => r.score));
  return { recent, before, delta: recent !== null && before !== null ? recent - before : null };
}
