export interface Cycle {
  id: string;
  start_date: string; // ISO 8601 UTC
  length_days?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
