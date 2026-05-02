import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  searchPhoneNumbers,
  createInboundTrunk,
  createDispatchRule,
  purchasePhoneNumber,
  releasePhoneNumber,
  deleteDispatchRule,
  deleteTrunk,
} from "@/lib/livekit/phone-numbers";
import { updateTelephonyProject } from "@/lib/project/actions";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  const { data: organization } = await supabase
    .from("organizations")
    .select("is_subscribed, is_free_plan")
    .eq("organization_id", account?.organization_id)
    .single();

  const isPaidPlan =
    Boolean(organization?.is_subscribed) && !organization?.is_free_plan;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action as string | undefined;

  // ─── Search ─────────────────────────────────────────────────────────────
  if (action === "search") {
    const areaCode = (body.areaCode as string | undefined) ?? "";
    if (!areaCode) {
      return NextResponse.json(
        { error: "areaCode is required" },
        { status: 400 },
      );
    }
    try {
      const numbers = await searchPhoneNumbers(areaCode);
      return NextResponse.json({ numbers });
    } catch (err) {
      console.error("[phone-numbers] search error:", err);
      return NextResponse.json(
        { error: "Failed to search phone numbers" },
        { status: 502 },
      );
    }
  }

  // ─── Purchase ────────────────────────────────────────────────────────────
  if (action === "purchase") {
    if (!isPaidPlan) {
      return NextResponse.json(
        {
          error:
            "Buying phone numbers is available on paid plans. Upgrade to continue.",
        },
        { status: 403 },
      );
    }

    const projectId = body.projectId as string | undefined;
    const e164 = body.e164 as string | undefined;
    if (!projectId || !e164) {
      return NextResponse.json(
        { error: "projectId and e164 are required" },
        { status: 400 },
      );
    }

    try {
      // 1. Create inbound SIP trunk for this number
      const { sip_trunk_id } = await createInboundTrunk(projectId, e164);

      // 2. Create dispatch rule tied to the trunk
      const { sip_dispatch_rule_id } = await createDispatchRule(
        projectId,
        sip_trunk_id,
      );

      // 3. Purchase the phone number and link to dispatch rule
      const purchased = await purchasePhoneNumber(e164, sip_dispatch_rule_id);

      // 4. Persist to Supabase
      await updateTelephonyProject({
        projectId,
        telephoneNumber: e164,
        phoneNumberProvider: "livekit",
        sipTrunkId: sip_trunk_id,
        sipDispatchRuleId: sip_dispatch_rule_id,
        livekitPhoneNumberId: purchased.id,
        agentStatus: "connected",
      });

      return NextResponse.json({
        ok: true,
        phoneNumber: e164,
        sipTrunkId: sip_trunk_id,
        sipDispatchRuleId: sip_dispatch_rule_id,
      });
    } catch (err) {
      console.error("[phone-numbers] purchase error:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Failed to purchase number",
        },
        { status: 502 },
      );
    }
  }

  // ─── Release ─────────────────────────────────────────────────────────────
  if (action === "release") {
    const projectId = body.projectId as string | undefined;
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    const { data: telephonyProject } = await supabase
      .from("telephony_projects")
      .select(
        "project_id, organization_id, telephone_number, livekit_phone_number_id, sip_dispatch_rule_id, sip_trunk_id",
      )
      .eq("project_id", projectId)
      .eq("organization_id", account?.organization_id)
      .maybeSingle();

    if (!telephonyProject) {
      return NextResponse.json(
        { error: "Telephony project not found" },
        { status: 404 },
      );
    }

    if (
      !telephonyProject.livekit_phone_number_id &&
      !telephonyProject.telephone_number
    ) {
      return NextResponse.json(
        { error: "No purchased number found for this project" },
        { status: 400 },
      );
    }

    try {
      await releasePhoneNumber({
        id: telephonyProject.livekit_phone_number_id ?? undefined,
        e164: telephonyProject.telephone_number ?? undefined,
      });

      if (telephonyProject.sip_dispatch_rule_id) {
        try {
          await deleteDispatchRule(telephonyProject.sip_dispatch_rule_id);
        } catch (err) {
          console.warn("[phone-numbers] delete dispatch rule failed:", err);
        }
      }

      if (telephonyProject.sip_trunk_id) {
        try {
          await deleteTrunk(telephonyProject.sip_trunk_id);
        } catch (err) {
          console.warn("[phone-numbers] delete trunk failed:", err);
        }
      }

      await updateTelephonyProject({
        projectId,
        telephoneNumber: null,
        phoneNumberProvider: null,
        livekitPhoneNumberId: null,
        sipDispatchRuleId: null,
        sipTrunkId: null,
        agentStatus: "not_connected",
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[phone-numbers] release error:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Failed to release number",
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
