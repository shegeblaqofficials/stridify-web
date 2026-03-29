export interface Organization {
  id: number;
  organization_id: string;
  name: string;
  token_balance: number;
  is_subscribed: boolean;
  is_free_plan: boolean;
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: number;
  organization_id: number;
  user_id: number;
  role: "owner" | "admin" | "member";
  created_at: string;
  updated_at: string;
}

export interface OrganizationWithMembership extends Organization {
  membership: OrganizationMembership;
}

export interface CreateOrganizationInput {
  name: string;
}

export interface UpdateOrganizationInput {
  name?: string;
}
