"use server";

import type { Account } from "@/model/account/account";
import { createClient } from "../supabase/server";
import { Organization } from "@/model/account/organization";
import { fa } from "zod/locales";

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

  if (existing) return existing as Account;

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
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating account:", error.message);
    return null;
  }

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
      token_balance: 100000,
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

export async function getOrganizationMembers(
  organizationId: string,
): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("organization_id", organizationId);
  return (data as Account[]) ?? [];
}
