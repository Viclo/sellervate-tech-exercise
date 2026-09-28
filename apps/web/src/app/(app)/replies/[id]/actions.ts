"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getNextQueueItemId } from "@/lib/reviews/queries";
import { createClient } from "@/lib/supabase/server";

export type ReviewFormState = { error: string | null };

const submitReviewInput = z.object({
  replyId: z.uuid(),
  score: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000),
  isExemplar: z.boolean(),
  tagIds: z.array(z.uuid()).max(20),
});

/**
 * Validates the form and hands it to submit_review, which saves review + tags in one
 * transaction under RLS. The reviewer is never taken from the form: it is auth.uid().
 */
export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const parsed = submitReviewInput.safeParse({
    replyId: formData.get("replyId"),
    score: formData.get("score"),
    comment: formData.get("comment") ?? "",
    isExemplar: formData.get("isExemplar") === "on",
    tagIds: formData.getAll("tagIds"),
  });
  if (!parsed.success) return { error: "Pick a score from 1 to 5 before saving." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_reply_id: parsed.data.replyId,
    p_score: parsed.data.score,
    p_comment: parsed.data.comment,
    p_is_exemplar: parsed.data.isExemplar,
    p_tag_ids: parsed.data.tagIds,
  });
  if (error) return { error: errorMessage(error.code) };

  revalidatePath("/queue");
  const next = await getNextQueueItemId();
  redirect(next ? `/replies/${next}` : "/queue");
}

function errorMessage(code: string | undefined) {
  switch (code) {
    case "23505":
      return "Someone already reviewed this reply. Reload the page to see their review.";
    case "P0002":
    case "42501":
      return "You can only review replies on brands you lead.";
    default:
      return "Could not save the review. Nothing was saved, try again.";
  }
}
