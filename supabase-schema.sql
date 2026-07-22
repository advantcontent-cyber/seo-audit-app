create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  pages_checked int not null,
  summary jsonb not null,
  findings jsonb not null,
  started_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_runs_domain_idx on audit_runs (domain);
create index if not exists audit_runs_created_at_idx on audit_runs (created_at desc);
