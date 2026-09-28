import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getBrandReviews } from "@/lib/reviews/queries";
import { SEVERITY_CLASSES, asSeverity } from "@/lib/reviews/scores";
import { comparePeriods, formatAverage, topTags, weeklyAverages } from "@/lib/reviews/stats";

const WEEKS = 8;
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const brand = user?.memberships.find((m) => m.role === "lead" && m.brand.slug === slug)?.brand;
  if (!brand) notFound();

  const reviews = await getBrandReviews(brand.id, WEEKS);
  const weeks = weeklyAverages(reviews, WEEKS);
  const { recent: last4, delta } = comparePeriods(reviews, 4);
  const tags = topTags(reviews);
  const exemplars = reviews.filter((r) => r.is_exemplar && r.reply);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-caption font-medium uppercase tracking-widest text-primary">Brand overview</p>
        <h1 className="text-title font-semibold">{brand.name}</h1>
        <p className="text-secondary">The last {WEEKS} weeks of reviews: what you can show the brand.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
          <p className="font-medium">No reviews in the last {WEEKS} weeks</p>
          <p className="mt-1 text-secondary">Trends appear once replies for {brand.name} are reviewed.</p>
        </div>
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Average, last 4 weeks</dt>
              <dd className="text-display font-semibold">{formatAverage(last4)}</dd>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Versus the 4 weeks before</dt>
              <dd
                className={`text-display font-semibold ${delta === null ? "" : delta >= 0 ? "text-success" : "text-error"}`}
              >
                {delta === null ? "–" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`}
              </dd>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Reviewed replies</dt>
              <dd className="text-display font-semibold">{reviews.length}</dd>
            </div>
          </dl>

          <div className="rounded-box border border-base-300 bg-base-100 p-5">
            <h2 className="font-medium">Average score per week</h2>
            <ol className="mt-4 flex h-44 items-end gap-2" aria-label="Average score per week, oldest first">
              {weeks.map((w) => (
                <li key={w.start.toISOString()} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-caption font-medium">{formatAverage(w.average)}</span>
                  <span
                    className="w-full max-w-12 rounded-t-selector bg-primary/80"
                    style={{ height: `${((w.average ?? 0) / 5) * 100}%` }}
                    title={`${w.count} reviews`}
                  />
                  <span className="text-caption text-secondary">{dayMonth.format(w.start)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-box border border-base-300 bg-base-100 p-5">
              <h2 className="font-medium">What we keep getting wrong</h2>
              {tags.length === 0 ? (
                <p className="mt-2 text-secondary">Nothing flagged in this period.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {tags.map((t) => (
                    <li key={t.label} className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-caption ${SEVERITY_CLASSES[asSeverity(t.severity)]}`}
                      >
                        {t.label}
                      </span>
                      <span className="text-secondary">{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-5">
              <h2 className="font-medium">Examples for new joiners</h2>
              {exemplars.length === 0 ? (
                <p className="mt-2 text-secondary">No reply marked as an example yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {exemplars.map((r) => (
                    <li key={r.id}>
                      <Link href={`/replies/${r.reply!.id}`} className="link link-hover">
                        {r.score} · {r.reply!.subject}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
