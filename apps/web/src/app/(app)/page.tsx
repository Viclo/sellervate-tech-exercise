import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.isLead) redirect("/queue");

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-title font-semibold">Hi, {user.fullName.split(" ")[0]}</h1>
        <p className="text-secondary">These are the brands you work on.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {user.memberships.map((m) => (
          <li key={m.brand.id} className="rounded-box border border-base-300 bg-base-100 p-4">
            <p className="font-medium">{m.brand.name}</p>
            <p className="text-caption text-secondary">
              {m.role === "lead" ? "You lead this brand" : "You reply for this brand"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
