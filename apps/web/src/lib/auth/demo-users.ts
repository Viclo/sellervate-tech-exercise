import "server-only";

/**
 * Seeded accounts offered by the user switcher (login is stubbed in this exercise).
 * Display only: what each person can see comes from brand_memberships + RLS, not from this list.
 */
export const DEMO_USERS = [
  { email: "marta@sellervate.test", name: "Marta Ruiz", role: "Team lead" },
  { email: "nuria@sellervate.test", name: "Nuria Vidal", role: "Team lead" },
  { email: "dani@sellervate.test", name: "Dani Ortega", role: "Specialist" },
  { email: "laura@sellervate.test", name: "Laura Méndez", role: "Specialist" },
  { email: "pablo@sellervate.test", name: "Pablo Serrano", role: "Specialist" },
] as const;

export function demoUserPassword() {
  const password = process.env.DEMO_USER_PASSWORD;
  if (!password) throw new Error("DEMO_USER_PASSWORD is not set. Run `pnpm env:local`.");
  return password;
}
