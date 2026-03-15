"use server";

import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/model/account/account";

export async function upsertAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) return null;

  const { data: existing } = await supabase
    .from("account")
    .select("*")
    .eq("email", user.email)
    .single();

  if (existing) return existing as Account;

  const fullName = (user.user_metadata?.full_name as string) ?? "";
  const nameParts = fullName.split(" ");

  const { data: created, error } = await supabase
    .from("account")
    .insert({
      email: user.email,
      user_id: user.id,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(" ") || null,
      photo_url: (user.user_metadata?.avatar_url as string) || null,
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

export async function getAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) return null;

  const { data } = await supabase
    .from("account")
    .select("*")
    .eq("email", user.email)
    .single();

  return (data as Account) ?? null;
}
