create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text not null,
  latest_health_score int,
  last_audited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  domain text not null,
  status text not null default 'complete',
  current_step text,
  pages_checked int not null default 0,
  health_score int,
  summary jsonb not null default '{"critical":0,"high":0,"medium":0,"low":0}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  started_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_runs_domain_idx on audit_runs (domain);
create index if not exists audit_runs_created_at_idx on audit_runs (created_at desc);
create index if not exists audit_runs_project_id_idx on audit_runs (project_id);
