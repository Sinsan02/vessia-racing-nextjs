// Database types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  driver_id?: number;
}

export interface Driver {
  id: number;
  name: string;
  team: string;
}

export interface League {
  id: number;
  name: string;
  created_by: number;
}

export interface LeagueDriver {
  driver_id: number;
  league_id: number;
  points: number;
  races_completed: number;
}

export interface PointsHistory {
  id: number;
  driver_id: number;
  league_id: number;
  points_change: number;
  races_change: number;
  changed_by: number;
  changed_at: string;
}

export interface DecodedToken {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}