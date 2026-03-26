import { Vercel } from "@vercel/sdk";

let _client: Vercel | null = null;

export function getVercelClient(): Vercel {
  if (!_client) {
    _client = new Vercel({
      bearerToken: process.env.VERCEL_TOKEN!,
    });
  }
  return _client;
}

export const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID!;
