import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendApprovalEmail } from "@/lib/email/approval";

export async function GET(req: NextRequest) {
  try {
    // Extract the 'amount' parameter from URL search params
    const { searchParams } = new URL(req.url);
    const amountParam = searchParams.get("amount");

    if (!amountParam) {
      return NextResponse.json(
        { error: "Missing 'amount' query parameter" },
        { status: 400 },
      );
    }

    const amount = parseInt(amountParam, 10);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive integer" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Fetch the next N inactive organizations
    const { data: inactiveOrgs, error: fetchError } = await supabase
      .from("organizations")
      .select("organization_id, name")
      .eq("is_active", false)
      .order("created_at", { ascending: true })
      .limit(amount);

    if (fetchError) {
      console.error(
        "[approve-orgs] Error fetching inactive organizations:",
        fetchError,
      );
      return NextResponse.json(
        { error: "Failed to fetch inactive organizations" },
        { status: 500 },
      );
    }

    if (!inactiveOrgs || inactiveOrgs.length === 0) {
      return NextResponse.json(
        {
          message: "No inactive organizations to approve",
          approved: [],
          count: 0,
        },
        { status: 200 },
      );
    }

    const approvedOrgs = [];

    // 2. For each organization, update is_active to true and send email
    for (const org of inactiveOrgs) {
      try {
        // Update organization to active
        const { error: updateError } = await supabase
          .from("organizations")
          .update({ is_active: true })
          .eq("organization_id", org.organization_id);

        if (updateError) {
          console.error(
            `[approve-orgs] Error updating organization ${org.organization_id}:`,
            updateError,
          );
          continue;
        }

        // Get the primary account/contact for this organization
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("email, first_name")
          .eq("organization_id", org.organization_id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (accountError || !account) {
          console.error(
            `[approve-orgs] Error fetching account for organization ${org.organization_id}:`,
            accountError,
          );
          continue;
        }

        // Send approval email
        await sendApprovalEmail(account.email, account.first_name || undefined);

        approvedOrgs.push({
          organization_id: org.organization_id,
          name: org.name,
          email: account.email,
          firstName: account.first_name,
        });

        console.log(
          `[approve-orgs] Approved organization: ${org.organization_id} (${org.name})`,
        );
      } catch (err) {
        console.error(
          `[approve-orgs] Unexpected error processing organization ${org.organization_id}:`,
          err,
        );
      }
    }

    return NextResponse.json(
      {
        message: `Successfully approved ${approvedOrgs.length} organization(s)`,
        approved: approvedOrgs,
        count: approvedOrgs.length,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[approve-orgs] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
