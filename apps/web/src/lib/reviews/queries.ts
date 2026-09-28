import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Every query here runs as the signed-in user: RLS decides which rows come back.

export type QueueItem = {
  id: string;
  brandName: string;
  brandSlug: string;
  specialistName: string;
  specialistRecentReviews: number;
  channel: string;
  customerName: string;
  subject: string;
  receivedAt: string;
  sentAt: string;
};

/** Unreviewed replies on the caller's brands. Least-reviewed specialists first, then oldest. */
export async function getReviewQueue(brandSlug?: string): Promise<QueueItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("review_queue")
    .select("*")
    .order("specialist_recent_reviews", { ascending: true })
    .order("sent_at", { ascending: true });
  if (brandSlug) query = query.eq("brand_slug", brandSlug);

  const { data, error } = await query;
  if (error) throw error;

  return data.flatMap((row) =>
    row.id && row.sent_at && row.received_at
      ? [
          {
            id: row.id,
            brandName: row.brand_name ?? "",
            brandSlug: row.brand_slug ?? "",
            specialistName: row.specialist_name ?? "",
            specialistRecentReviews: row.specialist_recent_reviews ?? 0,
            channel: row.channel ?? "",
            customerName: row.customer_name ?? "",
            subject: row.subject ?? "",
            receivedAt: row.received_at,
            sentAt: row.sent_at,
          },
        ]
      : [],
  );
}

export async function getNextQueueItemId(): Promise<string | null> {
  const [next] = await getReviewQueue();
  return next?.id ?? null;
}

const REPLY_SELECT = `
  id, subject, channel, customer_name, customer_message, reply_body, received_at, sent_at,
  brand:brands(id, name, slug, voice_summary, procedures),
  specialist:profiles!replies_specialist_id_fkey(id, full_name),
  reviews(
    id, score, comment, is_exemplar, created_at,
    reviewer:profiles!reviews_reviewer_id_fkey(full_name),
    review_tag_links(tag:review_tags(id, label, severity))
  )
`;

/** A reply with its brand, author and review. null when it does not exist or RLS hides it. */
export async function getReply(id: string) {
  // A malformed id would be a Postgres error (500); treat it as not found instead.
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("replies").select(REPLY_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export type ReplyWithReview = NonNullable<Awaited<ReturnType<typeof getReply>>>;

/** Global tags plus the brand's own, most severe first. */
export async function getReviewTags(brandId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_tags")
    .select("id, label, severity, brand_id")
    .eq("active", true)
    .or(`brand_id.is.null,brand_id.eq.${brandId}`)
    .order("severity")
    .order("label");
  if (error) throw error;
  return data;
}

export type ReviewTag = Awaited<ReturnType<typeof getReviewTags>>[number];
