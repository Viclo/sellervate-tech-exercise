import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SLOW_RESPONSE_MINUTES, formatDateTime, formatDuration, responseMinutes } from "@/lib/format";
import { getReviewQueue } from "@/lib/reviews/queries";

export default async function QueuePage({ searchParams }: PageProps<"/queue">) {
  const user = await getCurrentUser();
  if (!user?.isLead) notFound();

  const { brand } = await searchParams;
  const brandSlug = typeof brand === "string" ? brand : undefined;
  const items = await getReviewQueue(brandSlug);
  const leadBrands = user.memberships.filter((m) => m.role === "lead").map((m) => m.brand);
  const activeBrand = leadBrands.find((b) => b.slug === brandSlug);

  const filters = [{ href: "/queue", label: "All brands", active: !brandSlug }].concat(
    leadBrands.map((b) => ({ href: `/queue?brand=${b.slug}`, label: b.name, active: b.slug === brandSlug })),
  );

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-title font-semibold">Review queue</h1>
        <p className="text-secondary">
          Replies from the last 7 days that nobody has reviewed yet. People with the fewest recent reviews come
          first, so five reviews a day are spread across the team.
        </p>
      </div>

      {leadBrands.length > 1 && (
        <nav className="flex flex-wrap gap-1.5" aria-label="Filter by brand">
          {filters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              aria-current={f.active ? "page" : undefined}
              className={`rounded-full border px-3 py-1 text-caption transition-colors ${
                f.active
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 hover:bg-base-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      )}

      {items.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
          <p className="font-medium">All caught up</p>
          <p className="mt-1 text-secondary">
            Every reply sent in the last 7 days{activeBrand ? ` for ${activeBrand.name}` : ""} has a review.
          </p>
        </div>
      ) : (
        <>
          <p className="text-caption text-secondary">
            {items.length} {items.length === 1 ? "reply" : "replies"} waiting
          </p>
          <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
            {items.map((item) => {
              const minutes = responseMinutes(item.receivedAt, item.sentAt);
              return (
                <li key={item.id}>
                  <Link
                    href={`/replies/${item.id}`}
                    className="grid gap-1 px-5 py-4 transition-colors hover:bg-base-200 sm:grid-cols-12 sm:items-center sm:gap-4"
                  >
                    <div className="sm:col-span-6">
                      <p className="text-caption font-medium uppercase tracking-widest text-primary">
                        {item.brandName}
                      </p>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-caption text-secondary">
                        {item.customerName} · {item.channel}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <p>{item.specialistName}</p>
                      <p className="text-caption text-secondary">
                        {item.specialistRecentReviews} reviews in 30 days
                      </p>
                    </div>
                    <div className="sm:col-span-3 sm:text-right">
                      <p>{formatDateTime(item.sentAt)}</p>
                      <p
                        className={`text-caption ${minutes > SLOW_RESPONSE_MINUTES ? "font-medium text-error" : "text-secondary"}`}
                      >
                        Answered in {formatDuration(minutes)}
                      </p>
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
