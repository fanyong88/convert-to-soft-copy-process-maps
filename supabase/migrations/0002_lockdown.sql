-- Sprint 5: Lock it down — per-consultant auth + private storage.
--
-- Legacy rows created before auth existed (user_id IS NULL) stay visible AND
-- editable by any authenticated consultant, per docs/CLAUDE.md: "Seeded rows
-- are demo placeholders the user can also create/edit/delete." New rows are
-- strictly owner-scoped: auth.uid() = user_id.

alter table process_maps add column if not exists photo_path text;
update process_maps
  set photo_path = split_part(photo_url, '/map-photos/', 2)
  where photo_path is null and photo_url like '%/map-photos/%';

-- process_maps
drop policy if exists "process_maps_v1_read" on process_maps;
drop policy if exists "process_maps_v1_write" on process_maps;

create policy "process_maps_select" on process_maps for select
  using (auth.uid() = user_id or user_id is null);
create policy "process_maps_insert" on process_maps for insert
  with check (auth.uid() = user_id);
create policy "process_maps_update" on process_maps for update
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);
create policy "process_maps_delete" on process_maps for delete
  using (auth.uid() = user_id or user_id is null);

-- process_steps
drop policy if exists "process_steps_v1_read" on process_steps;
drop policy if exists "process_steps_v1_write" on process_steps;

create policy "process_steps_select" on process_steps for select
  using (auth.uid() = user_id or user_id is null);
create policy "process_steps_insert" on process_steps for insert
  with check (auth.uid() = user_id);
create policy "process_steps_update" on process_steps for update
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);
create policy "process_steps_delete" on process_steps for delete
  using (auth.uid() = user_id or user_id is null);

-- export_logs (append-only from the app's perspective; no update/delete policy)
drop policy if exists "export_logs_v1_read" on export_logs;
drop policy if exists "export_logs_v1_write" on export_logs;

create policy "export_logs_select" on export_logs for select
  using (auth.uid() = user_id or user_id is null);
create policy "export_logs_insert" on export_logs for insert
  with check (auth.uid() = user_id);

-- Storage: map-photos becomes private; the app serves photos via signed
-- URLs generated server-side with the service-role key.
update storage.buckets set public = false where id = 'map-photos';
