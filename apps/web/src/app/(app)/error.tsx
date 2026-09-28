"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-title font-semibold">Something went wrong loading this page</h1>
      <p className="text-secondary">
        Nothing you entered was lost. If it keeps happening, check that local Supabase is running.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary btn-sm">
        Try again
      </button>
    </div>
  );
}
