"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_USERS, demoUserPassword } from "@/lib/auth/demo-users";
import { createClient } from "@/lib/supabase/server";

const switchUserInput = z.object({
  email: z.string().refine((email) => DEMO_USERS.some((u) => u.email === email)),
});

/** Stubbed login: signs in as a seeded user with the shared demo password. */
export async function switchUser(formData: FormData) {
  const parsed = switchUserInput.safeParse({ email: formData.get("email") });
  if (!parsed.success) redirect("/switch?error=unknown-user");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: demoUserPassword(),
  });
  if (error) redirect("/switch?error=sign-in-failed");

  redirect("/");
}
