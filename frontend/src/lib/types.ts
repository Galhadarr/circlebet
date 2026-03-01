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
  market_count: number;
  created_at: string;
}

export interface CircleMemberResponse {
  user_id: string;
  display_name: string;
  balance: string;
  joined_at: string;
}

export interface MarketResponse {
  id: string;
  circle_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  end_date: string;
  price_yes: string;
  price_no: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  outcome: "YES" | "NO" | null;
  creator_id: string;
  created_at: string;
  yes_volume: string;
  no_volume: string;
}

export interface MarketDetailResponse extends MarketResponse {
  total_volume: string;
  q_yes: string;
  q_no: string;
  b: string;
  yes_bettors: number;
  no_bettors: number;
}

export interface TradeResponse {
  trade_id: string;
  side: "YES" | "NO";
  direction: "BUY" | "SELL";
  amount: string;
  shares: string;
  price_at_trade: string;
  new_price_yes: string;
  new_price_no: string;
  new_balance: string;
}

export interface TradePreviewResponse {
  estimated_shares: string;
  estimated_price_after_yes: string;
  estimated_price_after_no: string;
  price_impact: string;
}

export interface TradeHistoryEntry {
  id: string;
  user_id: string;
  display_name: string;
  side: "YES" | "NO";
  direction: "BUY" | "SELL";
  amount: string;
  shares: string;
  price_at_trade: string;
  timestamp: string;
}

export interface HoldingResponse {
  market_id: string;
  market_title: string;
  circle_id: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  yes_shares: string;
  no_shares: string;
  current_price_yes: string;
  current_price_no: string;
  current_value: string;
}

export interface PortfolioResponse {
  holdings: HoldingResponse[];
}

export interface UserTradeHistoryEntry {
  id: string;
  market_id: string;
  market_title: string;
  side: "YES" | "NO";
  direction: "BUY" | "SELL";
  amount: string;
  shares: string;
  price_at_trade: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  balance: string;
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

export interface MarketCreate {
  circle_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  end_date: string;
}

export interface TradeRequest {
  side: "YES" | "NO";
  direction?: "BUY" | "SELL";
  amount: number;
}

export interface ResolveRequest {
  outcome: "YES" | "NO";
}
