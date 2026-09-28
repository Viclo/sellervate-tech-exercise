import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-title font-semibold">Nothing here</h1>
      <p className="text-secondary">
        This page does not exist, or it belongs to a brand you do not work on.
      </p>
      <Link href="/" className="btn btn-primary btn-sm">
        Back to your brands
      </Link>
    </main>
  );
}
