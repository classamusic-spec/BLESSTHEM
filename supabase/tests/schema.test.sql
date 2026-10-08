-- Behavioural tests for supabase/schema.sql. Run with `npm run test:schema`.
-- Each check raises on failure; the run ends with "ALL SCHEMA TESTS PASSED".
\set ON_ERROR_STOP 1
set client_min_messages = notice;
create schema t;
grant usage on schema t to public;
create function t.expect_error(stmt text, pattern text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlerrm !~* pattern then raise exception 'expected error matching "%", got: %', pattern, sqlerrm; end if;
    raise notice 'ok   rejected: % (%)', left(regexp_replace(stmt, '\s+', ' ', 'g'), 80), sqlerrm;
    return;
  end;
  raise exception 'expected error matching "%" but it succeeded: %', pattern, stmt;
end $$;
create function t.expect_eq(actual bigint, expected bigint, label text) returns void language plpgsql as $$
begin
  if actual is distinct from expected then raise exception 'FAIL %: expected %, got %', label, expected, actual; end if;
  raise notice 'ok   %', label;
end $$;
grant execute on all functions in schema t to public;

insert into auth.users values ('00000000-0000-0000-0000-00000000000a', 'a@example.com'), ('00000000-0000-0000-0000-00000000000b', 'b@example.com');

-- ── Household A (free) ──
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select public.create_household('h_a', 'The Ambers');
insert into public.people (id, household_id, name, relationship, age_group, pronouns, focus_topics, hue)
values ('p_a1', 'h_a', 'Noah', 'son', 'elementary', 'he', '{courage,friendship}', 'sage'),
       ('p_a2', 'h_a', 'Ella', 'daughter', 'preschool', 'she', '{}', 'rose');
select t.expect_error($$insert into public.people (id, household_id, name, relationship, hue) values ('p_a3', 'h_a', 'Sam', 'child', 'sky')$$, 'free_limit_people');
select t.expect_error($$insert into public.households (id) values ('h_x')$$, 'row-level security|permission denied');
select t.expect_error($$update public.subscriptions set tier = 'plus', status = 'active' where household_id = 'h_a'$$, 'permission denied');
insert into public.blessings (id, household_id, person_id, date, entry_id, topic_id, source)
values ('b_1', 'h_a', 'p_a1', current_date, 'courage-jos-1-9', 'courage', 'daily');

-- ── Household B cannot see or touch A ──
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select public.create_household('h_b');
select t.expect_error($$insert into public.people (id, household_id, name, relationship, hue) values ('p_bad', 'h_b', 'X', 'cousin', 'sky')$$, 'check constraint');
select t.expect_eq((select count(*) from public.people), 0, 'B cannot see A''s people');
select t.expect_eq((select count(*) from public.blessings), 0, 'B cannot see A''s blessings');
select t.expect_eq((select count(*) from public.households), 1, 'B sees only their own household');
select t.expect_eq((select count(*) from public.household_members), 1, 'B sees only their own membership');
select t.expect_error($$insert into public.people (id, household_id, name, relationship, hue) values ('p_b9', 'h_a', 'Intruder', 'other', 'sky')$$, 'row-level security');
with u as (update public.people set name = 'Changed' where id = 'p_a1' returning 1)
select t.expect_eq((select count(*) from u), 0, 'B cannot update A''s people');
with d as (delete from public.blessings where id = 'b_1' returning 1)
select t.expect_eq((select count(*) from d), 0, 'B cannot delete A''s blessings');
select t.expect_error($$insert into storage.objects (bucket_id, name) values ('journal-photos', 'h_a/ph_9.jpg')$$, 'row-level security');

-- ── Plus (granted by the service role) lifts the limits ──
reset role;
set role service_role;
update public.subscriptions set tier = 'plus', status = 'active', plan = 'annual', renews_at = now() + interval '1 year' where household_id = 'h_a';
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.people (id, household_id, name, relationship, hue) values ('p_a3', 'h_a', 'Sam', 'child', 'sky');
select t.expect_eq((select count(*) from public.people where deleted_at is null), 3, 'a Plus household can add a third person');

-- ── Leaving Plus keeps everyone; sync can still update existing rows ──
reset role;
set role service_role;
update public.subscriptions set tier = 'free', status = 'canceled' where household_id = 'h_a';
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.people (id, household_id, name, relationship, hue) values ('p_a3', 'h_a', 'Samuel', 'child', 'sky')
  on conflict (id) do update set name = excluded.name;
select t.expect_eq((select count(*) from public.people where name = 'Samuel'), 1, 'sync updates an existing person after leaving Plus');
select t.expect_error($$insert into public.people (id, household_id, name, relationship, hue) values ('p_a4', 'h_a', 'Mia', 'daughter', 'gold')$$, 'free_limit_people');

-- ── Favorites limit ──
insert into public.favorites (id, household_id, entry_id) select 'f_' || g, 'h_a', 'courage-jos-1-9' from generate_series(1, 10) g;
select t.expect_error($$insert into public.favorites (id, household_id, entry_id) values ('f_11', 'h_a', 'faith-heb-11-1')$$, 'free_limit_favorites');

-- ── Journal ──
insert into public.journal_entries (id, household_id, kind, person_id, text) values ('j_1', 'h_a', 'request', 'p_a1', 'Pray for Noah''s tryouts');
select t.expect_error($$insert into public.journal_entries (id, household_id, kind, text, answered_at) values ('j_2', 'h_a', 'note', 'x', now())$$, 'check constraint');
select pg_sleep(0.01);
update public.journal_entries set answered_at = now(), answer_note = 'He made the team' where id = 'j_1';
select t.expect_eq((select count(*) from public.journal_entries where id = 'j_1' and updated_at > created_at), 1, 'updated_at moves on every update');
delete from public.people where id = 'p_a1';
select t.expect_eq((select count(*) from public.journal_entries where id = 'j_1' and person_id is null), 1, 'removing a person keeps their journal entries, detached');
select t.expect_eq((select count(*) from public.blessings where id = 'b_1'), 0, 'removing a person removes their blessings');

-- ── Photos ──
insert into storage.objects (bucket_id, name) values ('journal-photos', 'h_a/ph_1.jpg');
select t.expect_error($$insert into storage.objects (bucket_id, name) values ('journal-photos', 'h_b/ph_2.jpg')$$, 'row-level security');
select t.expect_eq((select count(*) from storage.objects), 1, 'A sees their own photo');
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select t.expect_eq((select count(*) from storage.objects), 0, 'B cannot see A''s photos');

-- ── Analytics sink rejects content ──
reset role;
set role anon;
insert into public.product_events (install_id, name, props, occurred_at)
values ('inst_1', 'blessing_completed', '{"topic":"courage","source":"daily","first":true}', now());
select t.expect_error($$insert into public.product_events (install_id, name, props, occurred_at) values ('inst_1', 'search_performed', '{"query":"my son is being bullied by a boy in his class"}', now())$$, 'check constraint');
select t.expect_error($$insert into public.product_events (install_id, name, props, occurred_at) values ('inst_1', 'person_added', '{"person":{"name":"Noah"}}', now())$$, 'check constraint');
select t.expect_error($$select count(*) from public.product_events$$, 'permission denied');
select t.expect_eq((select count(*) from public.people), 0, 'signed-out visitors see no household data');
select t.expect_error($$insert into public.people (id, household_id, name, relationship, hue) values ('p_x', 'h_a', 'X', 'son', 'sky')$$, 'row-level security');
select t.expect_error($$select public.create_household('h_anon')$$, 'permission denied');
reset role;
select t.expect_eq((select count(*) from public.product_events), 1, 'only the content-free event was stored');
reset request.jwt.claim.sub;
set role authenticated;
select t.expect_error($$select public.create_household('h_nosub')$$, 'not_signed_in');
reset role;
\echo ALL SCHEMA TESTS PASSED
