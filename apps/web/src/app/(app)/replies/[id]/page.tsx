import Link from "next/link";
import { notFound } from "next/navigation";
import { Procedures } from "@/components/procedures";
import { ScoreBadge } from "@/components/score-badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatDateTime, formatDuration, responseMinutes } from "@/lib/format";
import { getReply, getReviewTags, type ReplyWithReview } from "@/lib/reviews/queries";
import { SEVERITY_CLASSES, asSeverity, scoreLabel } from "@/lib/reviews/scores";
import { ReviewForm } from "./review-form";

export default async function ReplyPage({ params }: PageProps<"/replies/[id]">) {
  const { id } = await params;
  const [user, reply] = await Promise.all([getCurrentUser(), getReply(id)]);
  // Not visible to this user (RLS) and not existing look the same on purpose.
  if (!user || !reply) notFound();

  const review = reply.reviews[0] ?? null;
  const leadsThisBrand = user.memberships.some((m) => m.role === "lead" && m.brand.id === reply.brand.id);
  const tags = !review && leadsThisBrand ? await getReviewTags(reply.brand.id) : [];
  const minutes = responseMinutes(reply.received_at, reply.sent_at);
  const firstName = reply.specialist.full_name.split(" ")[0];

  return (
    <article className="space-y-6">
      <Link href={leadsThisBrand ? "/queue" : "/"} className="text-caption text-secondary hover:text-base-content">
        ← {leadsThisBrand ? "Review queue" : "Back"}
      </Link>

      <header className="space-y-2">
        <p className="text-caption font-medium uppercase tracking-widest text-primary">{reply.brand.name}</p>
        <h1 className="text-title font-semibold">{reply.subject}</h1>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-secondary">
          <span>
            {reply.customer_name} · {reply.channel}
          </span>
          <span>Sent by {reply.specialist.full_name}</span>
          <span>{formatDateTime(reply.sent_at)}</span>
          <span className={minutes > reply.brand.response_target_minutes ? "font-medium text-error" : undefined}>
            Answered in {formatDuration(minutes)}
            <span className="text-secondary font-normal">
              {" "}
              (target {formatDuration(reply.brand.response_target_minutes)})
            </span>
          </span>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <section className="rounded-box border border-base-300 bg-base-100 p-5">
            <h2 className="mb-2 text-caption font-medium uppercase tracking-widest text-secondary">
              {reply.customer_name} wrote
            </h2>
            <p className="whitespace-pre-line text-secondary">{reply.customer_message}</p>
          </section>
          <section className="rounded-box border border-base-300 bg-base-100 p-5">
            <h2 className="mb-3 text-caption font-medium uppercase tracking-widest text-secondary">
              {firstName} replied
            </h2>
            <p className="whitespace-pre-line font-serif text-lead">{reply.reply_body}</p>
          </section>
        </div>

        <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
          <details open className="rounded-box border border-base-300 bg-base-100 p-5">
            <summary className="cursor-pointer font-medium">{reply.brand.name} procedures</summary>
            <p className="mt-2 text-caption text-secondary">{reply.brand.voice_summary}</p>
            <div className="mt-3">
              <Procedures markdown={reply.brand.procedures} />
            </div>
          </details>

          <section className="rounded-box border border-base-300 bg-base-100 p-5">
            {review ? (
              <ReviewSummary review={review} />
            ) : leadsThisBrand ? (
              <ReviewForm replyId={reply.id} tags={tags} />
            ) : (
              <p className="text-secondary">Not reviewed yet.</p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}

function ReviewSummary({ review }: { review: ReplyWithReview["reviews"][number] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ScoreBadge score={review.score} size="lg" />
        <div>
          <p className="font-medium">{scoreLabel(review.score)}</p>
          <p className="text-caption text-secondary">
            Reviewed by {review.reviewer?.full_name ?? "a team lead"} · {formatDateTime(review.created_at)}
          </p>
        </div>
      </div>
      {review.review_tag_links.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {review.review_tag_links.map(({ tag }) =>
            tag ? (
              <li
                key={tag.id}
                className={`rounded-full border px-3 py-1 text-caption ${SEVERITY_CLASSES[asSeverity(tag.severity)]}`}
              >
                {tag.label}
              </li>
            ) : null,
          )}
        </ul>
      )}
      {review.comment && <p className="whitespace-pre-line">{review.comment}</p>}
      {review.is_exemplar && (
        <p className="text-caption font-medium text-primary">Marked as an example for new joiners</p>
      )}
    </div>
  );
}
