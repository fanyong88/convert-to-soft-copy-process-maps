create table if not exists process_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null default 'Untitled Map',
  client_name text,
  photo_url text,
  status text not null default 'draft',
  notes text
);

alter table process_maps enable row level security;
drop policy if exists "process_maps_v1_read" on process_maps;
create policy "process_maps_v1_read" on process_maps for select using (true);
drop policy if exists "process_maps_v1_write" on process_maps;
create policy "process_maps_v1_write" on process_maps for all using (true) with check (true);

create table if not exists process_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  map_id uuid not null references process_maps(id) on delete cascade,
  sequence integer not null default 0,
  label text not null,
  step_type text not null default 'task',
  notes text,
  label_source text,
  label_confidence numeric,
  label_review_status text default 'unreviewed'
);

alter table process_steps enable row level security;
drop policy if exists "process_steps_v1_read" on process_steps;
create policy "process_steps_v1_read" on process_steps for select using (true);
drop policy if exists "process_steps_v1_write" on process_steps;
create policy "process_steps_v1_write" on process_steps for all using (true) with check (true);

create table if not exists export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  map_id uuid not null references process_maps(id) on delete cascade,
  export_format text not null,
  triggered_by text
);

alter table export_logs enable row level security;
drop policy if exists "export_logs_v1_read" on export_logs;
create policy "export_logs_v1_read" on export_logs for select using (true);
drop policy if exists "export_logs_v1_write" on export_logs;
create policy "export_logs_v1_write" on export_logs for all using (true) with check (true);

insert into process_maps (id, name, client_name, photo_url, status, notes) values
  ('a1000000-0000-0000-0000-000000000001', 'Invoice Approval Process', 'Acme Corp', null, 'reviewed', 'Mapped in workshop on 2024-11-10'),
  ('a1000000-0000-0000-0000-000000000002', 'Customer Onboarding Flow', 'Brightline Ltd', null, 'draft', 'Needs step 4 review'),
  ('a1000000-0000-0000-0000-000000000003', 'IT Helpdesk Ticket Handling', 'Metro Bank', null, 'reviewed', 'Final version approved by client');

insert into process_steps (map_id, sequence, label, step_type, label_source, label_confidence, label_review_status) values
  ('a1000000-0000-0000-0000-000000000001', 1, 'Receive Invoice', 'start', 'ai_vision', 0.95, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000001', 2, 'Check Invoice Amount', 'decision', 'ai_vision', 0.88, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000001', 3, 'Send for Manager Approval', 'task', 'ai_vision', 0.91, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000001', 4, 'Process Payment', 'task', 'ai_vision', 0.93, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000001', 5, 'Archive Invoice', 'end', 'ai_vision', 0.97, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000002', 1, 'Receive New Client Form', 'start', 'ai_vision', 0.90, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000002', 2, 'Verify Identity Documents', 'task', 'ai_vision', 0.82, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000002', 3, 'Documents Valid?', 'decision', 'ai_vision', 0.65, 'unreviewed'),
  ('a1000000-0000-0000-0000-000000000002', 4, 'Create Client Account', 'task', 'ai_vision', 0.88, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000003', 1, 'User Submits Ticket', 'start', 'ai_vision', 0.96, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000003', 2, 'Triage Priority Level', 'decision', 'ai_vision', 0.89, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000003', 3, 'Assign to Support Agent', 'task', 'ai_vision', 0.92, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000003', 4, 'Resolve Issue', 'task', 'ai_vision', 0.94, 'reviewed'),
  ('a1000000-0000-0000-0000-000000000003', 5, 'Close Ticket', 'end', 'ai_vision', 0.98, 'reviewed');