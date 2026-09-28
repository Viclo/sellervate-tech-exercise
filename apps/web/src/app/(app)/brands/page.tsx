import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function BrandsPage() {
  const user = await getCurrentUser();
  if (!user?.isLead) notFound();
  const brands = user.memberships.filter((m) => m.role === "lead").map((m) => m.brand);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-title font-semibold">Brands</h1>
        <p className="text-secondary">The brands you lead. Open one to see its trend and recurring issues.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <li key={b.id}>
            <Link
              href={`/brands/${b.slug}`}
              className="block rounded-box border border-base-300 bg-base-100 p-4 transition-colors hover:bg-base-200"
            >
              <p className="font-medium">{b.name}</p>
              <p className="text-caption text-secondary">Trend, recurring issues, examples</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
