import { getCurrentUser } from "@/lib/auth/current-user";
import { DEMO_USERS } from "@/lib/auth/demo-users";
import { switchUser } from "./actions";

const ERRORS: Record<string, string> = {
  "unknown-user": "That person is not one of the demo accounts.",
  "sign-in-failed":
    "Could not sign in. Check that Supabase is running and the seed was applied (`pnpm db:reset`).",
};

export default async function SwitchUserPage({ searchParams }: PageProps<"/switch">) {
  const { error } = await searchParams;
  const current = await getCurrentUser();
  const errorMessage = typeof error === "string" ? ERRORS[error] : undefined;

  const groups = [
    { title: "Team leads", users: DEMO_USERS.filter((u) => u.role === "Team lead") },
    { title: "Specialists", users: DEMO_USERS.filter((u) => u.role === "Specialist") },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2">
        <p className="text-caption font-medium uppercase tracking-widest text-secondary">Reply Review</p>
        <h1 className="text-display font-semibold">Who are you today?</h1>
        <p className="text-secondary">
          Login is stubbed for this demo. What each person can see is enforced by the database, not by
          this screen.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="alert alert-error alert-soft">
          {errorMessage}
        </div>
      )}

      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="text-caption font-medium uppercase tracking-widest text-secondary">
            {group.title}
          </h2>
          <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
            {group.users.map((user) => {
              const isCurrent = current?.fullName === user.name;
              return (
                <li key={user.email}>
                  <form action={switchUser}>
                    <input type="hidden" name="email" value={user.email} />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-base-200 focus-visible:bg-base-200 focus-visible:outline-none"
                    >
                      <span className="font-medium">{user.name}</span>
                      {isCurrent && <span className="badge badge-sm badge-primary badge-soft">Current</span>}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
