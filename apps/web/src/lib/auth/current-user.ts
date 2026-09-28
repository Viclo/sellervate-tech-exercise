import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type BrandRole = "lead" | "specialist";

export type Membership = {
  role: BrandRole;
  brand: { id: string; name: string; slug: string };
};

export type CurrentUser = {
  id: string;
  fullName: string;
  memberships: Membership[];
  isLead: boolean;
  isSpecialist: boolean;
};

/**
 * The signed-in user and the brands they work on, once per request.
 * Used to shape navigation and copy. It is not an access check: queries are filtered by RLS.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileResult, membershipsResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    // Leads can also read other people's memberships on their brands, so filter to our own.
    supabase
      .from("brand_memberships")
      .select("role, brand:brands!inner(id, name, slug)")
      .eq("user_id", user.id)
      .order("role"),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (membershipsResult.error) throw membershipsResult.error;

  const memberships: Membership[] = membershipsResult.data.map((m) => ({
    role: m.role === "lead" ? "lead" : "specialist",
    brand: m.brand,
  }));

  return {
    id: user.id,
    fullName: profileResult.data.full_name,
    memberships,
    isLead: memberships.some((m) => m.role === "lead"),
    isSpecialist: memberships.some((m) => m.role === "specialist"),
  };
});
