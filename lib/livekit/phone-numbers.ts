/**
 * LiveKit Phone Numbers + SIP helpers.
 *
 * Phone Numbers API is accessed via raw Twirp HTTP because the JS server SDK
 * does not yet expose a PhoneNumberClient. SIP trunk / dispatch-rule creation
 * uses the SDK's SipClient.
 */

import { AccessToken, SipClient } from "livekit-server-sdk";

// ─── Shared Twirp helper ─────────────────────────────────────────────────────

function livekitHttpUrl(): string {
  const url = process.env.LIVEKIT_URL ?? "";
  // wss:// → https://, ws:// → http://
  return url.replace(/^wss?:\/\//, (m) =>
    m === "wss://" ? "https://" : "http://",
  );
}

async function makeSipAdminToken(): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY ?? "";
  const apiSecret = process.env.LIVEKIT_API_SECRET ?? "";
  const at = new AccessToken(apiKey, apiSecret, { ttl: "1h" });
  at.addGrant({
    roomCreate: false,
    roomList: false,
    canPublish: false,
    canSubscribe: false,
  });
  at.addSIPGrant({ admin: true });
  return at.toJwt();
}

async function twirpPost<T>(
  service: string,
  method: string,
  body: object,
): Promise<T> {
  const token = await makeSipAdminToken();
  const url = `${livekitHttpUrl()}/twirp/livekit.${service}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LiveKit Twirp ${method} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Phone Number types ───────────────────────────────────────────────────────

export interface LKPhoneNumber {
  id: string;
  e164_format: string;
  country_code: string;
  area_code: string;
  number_type: string;
  locality: string;
  region: string;
  capabilities: string[];
  status: string;
  sip_dispatch_rule_id?: string;
}

// ─── Phone Number API ─────────────────────────────────────────────────────────

export async function searchPhoneNumbers(
  areaCode: string,
  countryCode = "US",
  limit = 20,
): Promise<LKPhoneNumber[]> {
  const data = await twirpPost<{ items?: LKPhoneNumber[] }>(
    "PhoneNumberService",
    "SearchPhoneNumbers",
    { country_code: countryCode, area_code: areaCode, limit },
  );
  return data.items ?? [];
}

export async function purchasePhoneNumber(
  e164: string,
  sipDispatchRuleId?: string,
): Promise<{ id: string; e164_format: string; status: string }> {
  const body: Record<string, unknown> = { phone_numbers: [e164] };
  if (sipDispatchRuleId) body.sip_dispatch_rule_id = sipDispatchRuleId;
  const data = await twirpPost<{
    phone_numbers?: { id: string; e164_format: string; status: string }[];
  }>("PhoneNumberService", "PurchasePhoneNumber", body);
  const num = data.phone_numbers?.[0];
  if (!num) throw new Error("PurchasePhoneNumber returned no phone_numbers");
  return num;
}

export async function listProjectPhoneNumbers(): Promise<LKPhoneNumber[]> {
  const data = await twirpPost<{ items?: LKPhoneNumber[] }>(
    "PhoneNumberService",
    "ListPhoneNumbers",
    { statuses: ["active"] },
  );
  return data.items ?? [];
}

export async function releasePhoneNumber(input: {
  id?: string;
  e164?: string;
}): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.id) body.ids = [input.id];
  if (input.e164) body.phone_numbers = [input.e164];
  if (!input.id && !input.e164) {
    throw new Error("releasePhoneNumber requires id or e164");
  }
  await twirpPost("PhoneNumberService", "ReleasePhoneNumbers", body);
}

// ─── SIP trunk + dispatch rule ────────────────────────────────────────────────

function sipClient(): SipClient {
  const host = livekitHttpUrl();
  return new SipClient(
    host,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
  );
}

export async function createInboundTrunk(
  projectId: string,
  e164: string,
): Promise<{ sip_trunk_id: string }> {
  const client = sipClient();
  const trunk = await client.createSipInboundTrunk(
    `stridify-${projectId}`,
    [e164],
    { krispEnabled: true },
  );
  return { sip_trunk_id: trunk.sipTrunkId };
}

export async function createDispatchRule(
  projectId: string,
  trunkId: string,
): Promise<{ sip_dispatch_rule_id: string }> {
  const client = sipClient();
  const rule = await client.createSipDispatchRule(
    {
      type: "individual",
      roomPrefix: `tel_${projectId}_`,
    },
    {
      name: `stridify-${projectId}`,
      trunkIds: [trunkId],
      attributes: { projectId },
    },
  );
  return { sip_dispatch_rule_id: rule.sipDispatchRuleId };
}

export async function deleteDispatchRule(
  sipDispatchRuleId: string,
): Promise<void> {
  const client = sipClient();
  await client.deleteSipDispatchRule(sipDispatchRuleId);
}

export async function deleteTrunk(sipTrunkId: string): Promise<void> {
  const client = sipClient();
  await client.deleteSipTrunk(sipTrunkId);
}
