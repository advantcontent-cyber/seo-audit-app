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
  pages_checked int not null,
  health_score int not null default 100,
  summary jsonb not null,
  findings jsonb not null,
  started_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_runs_domain_idx on audit_runs (domain);
create index if not exists audit_runs_created_at_idx on audit_runs (created_at desc);
create index if not exists audit_runs_project_id_idx on audit_runs (project_id);
