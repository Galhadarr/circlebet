export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface CircleResponse {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  invite_token: string;
  creator_id: string;
  member_count: number;
  bet_count: number;
  created_at: string;
}

export interface CircleMemberResponse {
  user_id: string;
  display_name: string;
  score: number;
  joined_at: string;
}

export interface BetOptionResponse {
  id: string;
  label: string;
  position: number;
}

export interface BetEntryResponse {
  id: string;
  user_id: string;
  option_id: string;
  is_double_down: boolean;
  entered_at: string;
}

export interface BetResponse {
  id: string;
  circle_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: "PENDING" | "ACTIVE" | "FINISHED";
  is_time_limited: boolean;
  end_time: string | null;
  options: BetOptionResponse[];
  result_option_id: string | null;
  entries_count: number;
  created_at: string;
  my_entry: BetEntryResponse | null;
}

export interface BetDetailResponse extends BetResponse {
  option_counts: Record<string, number>;
}

export interface BetCreate {
  circle_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  is_time_limited: boolean;
  end_time?: string | null;
  options: string[];
  creator_option_index: number;
  is_double_down: boolean;
}

export interface BetEntryCreate {
  option_id: string;
  is_double_down: boolean;
}

export interface BetEndRequest {
  result_option_id: string;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  bet_id: string | null;
  circle_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  score: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CircleCreate {
  name: string;
  description?: string | null;
  icon_url?: string | null;
}
