export interface Organization {
  id: number;
  organization_id: string;
  name: string;
  token_balance: number;
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
