export interface Account {
  id: number;
  email: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}
