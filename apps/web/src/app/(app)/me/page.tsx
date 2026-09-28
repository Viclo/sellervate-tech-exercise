import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreBadge } from "@/components/score-badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatDateTime } from "@/lib/format";
import { getMyReviews } from "@/lib/reviews/queries";
import { SEVERITY_CLASSES, asSeverity } from "@/lib/reviews/scores";
import { average, formatAverage, topTags } from "@/lib/reviews/stats";

export default async function MyReviewsPage() {
  const user = await getCurrentUser();
  if (!user?.isSpecialist) notFound();

  const replies = await getMyReviews(user.id);
  const reviews = replies.flatMap((r) => r.reviews);
  const avg = average(reviews.map((r) => r.score));
  const tags = topTags(reviews, 3);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-title font-semibold">My reviews</h1>
        <p className="text-secondary">What your team lead thought of your replies. Only you and your leads see this.</p>
      </div>

      {replies.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-secondary">When a lead reviews one of your replies it will show up here.</p>
        </div>
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Average score</dt>
              <dd className="text-display font-semibold">{formatAverage(avg)}</dd>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Reviewed replies</dt>
              <dd className="text-display font-semibold">{reviews.length}</dd>
            </div>
            <div className="rounded-box border border-base-300 bg-base-100 p-4">
              <dt className="text-caption text-secondary">Most frequent notes</dt>
              <dd className="mt-1 space-y-0.5">
                {tags.length === 0 ? (
                  <span className="text-secondary">Nothing flagged</span>
                ) : (
                  tags.map((t) => (
                    <p key={t.label}>
                      {t.label} <span className="text-secondary">× {t.count}</span>
                    </p>
                  ))
                )}
              </dd>
            </div>
          </dl>

          <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
            {replies.map((reply) => {
              const review = reply.reviews[0];
              return (
                <li key={reply.id}>
                  <Link href={`/replies/${reply.id}`} className="flex gap-4 px-5 py-4 transition-colors hover:bg-base-200">
                    <ScoreBadge score={review.score} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-caption text-secondary">
                        {reply.brand.name} · {formatDateTime(reply.sent_at)}
                      </p>
                      <p className="font-medium">{reply.subject}</p>
                      {review.comment && <p className="line-clamp-2 text-secondary">{review.comment}</p>}
                      {review.review_tag_links.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 pt-1">
                          {review.review_tag_links.map(({ tag }) =>
                            tag ? (
                              <li
                                key={tag.id}
                                className={`rounded-full border px-2.5 py-0.5 text-caption ${SEVERITY_CLASSES[asSeverity(tag.severity)]}`}
                              >
                                {tag.label}
                              </li>
                            ) : null,
                          )}
                        </ul>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
