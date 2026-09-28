"use client";

import { useActionState } from "react";
import type { ReviewTag } from "@/lib/reviews/queries";
import { SCORES, SEVERITY_CLASSES, asSeverity } from "@/lib/reviews/scores";
import { submitReview, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = { error: null };

export function ReviewForm({ replyId, tags }: { replyId: string; tags: ReviewTag[] }) {
  const [state, formAction, pending] = useActionState(submitReview, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="replyId" value={replyId} />

      <fieldset className="space-y-2">
        <legend className="font-medium">How good was it?</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {SCORES.map((score) => (
            <label key={score.value} className="cursor-pointer" title={score.label}>
              <input type="radio" name="score" value={score.value} required className="peer sr-only" />
              <span className="flex flex-col items-center gap-0.5 rounded-field border border-base-300 bg-base-100 px-1 py-2 text-center transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary hover:bg-base-200">
                <span className="text-lead font-semibold">{score.value}</span>
                <span className="text-caption text-secondary">{score.short}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-medium">
          What was off? <span className="font-normal text-secondary">Optional</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <label key={tag.id} className="cursor-pointer">
              <input type="checkbox" name="tagIds" value={tag.id} className="peer sr-only" />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-caption transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-content peer-focus-visible:ring-2 peer-focus-visible:ring-primary ${SEVERITY_CLASSES[asSeverity(tag.severity)]}`}
              >
                {tag.label}
                {tag.brand_id && <span className="opacity-70">· brand</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="font-medium">Note for the specialist</span>
        <textarea
          name="comment"
          rows={4}
          maxLength={2000}
          className="textarea w-full"
          placeholder="What should they do differently next time? They will read this."
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isExemplar" className="checkbox checkbox-sm" />
        <span>Worth showing to new joiners</span>
      </label>

      {state.error && (
        <div role="alert" className="alert alert-error alert-soft">
          {state.error}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Save and open next"}
      </button>
    </form>
  );
}
