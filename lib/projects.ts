export interface Project {
  id: string;
  domain: string;
  name: string;
  latest_health_score: number | null;
  last_audited_at: string | null;
  created_at: string;
}
