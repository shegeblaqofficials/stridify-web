"use server";

import type { Account } from "@/model/account/account";
import { createClient } from "../supabase/server";
import { Organization } from "@/model/account/organization";
import { ensureStripeCustomer } from "@/lib/stripe/actions";
import { onboardNewUser } from "@/lib/email/welcome";

export async function upsertAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) return null;

  const { data: existing } = await supabase
    .from("accounts")
    .select("*")
    .eq("email", user.email)
    .single();

  if (existing) {
    // Ensure returning users have a Stripe customer (dedup-safe)
    ensureStripeCustomer(
      existing.organization_id,
      user.email!,
      (user.user_metadata?.full_name as string) || undefined,
    ).catch((err) => {
      console.error(
        "[account] Failed to ensure Stripe customer on sign-in:",
        err instanceof Error ? err.message : String(err),
      );
    });
    return existing as Account;
  }

  const fullName = (user.user_metadata?.full_name as string) ?? "";
  const nameParts = fullName.split(" ");
  // Create new account if it doesn't exist
  const company = await createOrganization("Default");
  if (!company) {
    console.error("Failed to create organization for new account");
    return null;
  }
  const { data: created, error } = await supabase
    .from("accounts")
    .insert({
      email: user.email,
      user_id: user.id,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(" ") || null,
      photo_url: (user.user_metadata?.avatar_url as string) || null,
      organization_id: company.organization_id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating account:", error.message);
    return null;
  }

  // Add the user as an admin member of their new organization
  await supabase.from("organization_members").insert({
    organization_id: company.organization_id,
    user_id: user.id,
    role: "admin",
  });

  // Create Stripe customer for the new organization (fire-and-forget, dedup-safe)
  await ensureStripeCustomer(
    company.organization_id,
    user.email!,
    fullName || undefined,
  ).catch((err) => {
    console.error(
      "[account] Failed to create Stripe customer for new org:",
      err instanceof Error ? err.message : String(err),
    );
  });

  // Add to broadcast audience and send welcome email (fire-and-forget)
  onboardNewUser(
    user.email!,
    nameParts[0] || undefined,
    nameParts.slice(1).join(" ") || undefined,
  ).catch((err) => {
    console.error(
      "[account] Failed to onboard new user via email:",
      err instanceof Error ? err.message : String(err),
    );
  });

  return created as Account;
}

export async function getAccount(userId: string): Promise<Account | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .single();
  return (data as Account) ?? null;
}

export async function createOrganization(
  name: string,
): Promise<{ organization_id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      organization_id: crypto.randomUUID(),
      token_balance: 1000,
      is_subscribed: false,
      is_free_plan: true,
      plan: "Starter",
      is_active: false,
    })
    .select()
    .single();
  if (error || !data) {
    console.error("Error creating organization:", error?.message);
    return null;
  }
  return { organization_id: data.organization_id };
}

export async function getOrganization(
  organizationId: string,
): Promise<Organization | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("organization_id", organizationId)
    .single();
  return (data as Organization) ?? null;
}

export async function getUserOrganization(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("organization_id")
    .eq("user_id", userId)
    .single();
  return data as Organization;
}

export interface OrgMember {
  user_id: string;
  role: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrgMember[]> {
  const supabase = await createClient();

  // Get members from organization_members, then enrich with account info
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", organizationId);

  if (!members || members.length === 0) return [];

  const userIds = members.map((m) => m.user_id);
  const { data: accounts } = await supabase
    .from("accounts")
    .select("user_id, email, first_name, last_name, photo_url")
    .in("user_id", userIds);

  const accountMap = new Map((accounts ?? []).map((a) => [a.user_id, a]));

  return members.map((m) => {
    const acc = accountMap.get(m.user_id);
    return {
      user_id: m.user_id,
      role: m.role,
      email: acc?.email ?? "",
      first_name: acc?.first_name ?? null,
      last_name: acc?.last_name ?? null,
      photo_url: acc?.photo_url ?? null,
    };
  });
}
