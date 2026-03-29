import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccount, getOrganization } from "@/lib/account/actions";
import { createCustomerPortalSession } from "@/lib/stripe/actions";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccount(user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const org = await getOrganization(account.organization_id);
  if (!org?.is_active) {
    return NextResponse.json(
      { error: "Organization is not active. Please wait for beta access." },
      { status: 403 },
    );
  }

  const url = await createCustomerPortalSession(
    account.organization_id,
    user.email,
  );

  if (!url) {
    return NextResponse.json(
      { error: "Could not create portal session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
