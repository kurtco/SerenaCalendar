export interface PeriodLog {
  id: string;
  cycle_id?: string;
  day: string; // ISO 8601 date (YYYY-MM-DD) in UTC
  flow?: 'light' | 'medium' | 'heavy';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
