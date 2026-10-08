-- ════════════════════════════════════════════════════════════════════════════
--  Bless Them — production schema (Supabase · Postgres 15+)
--
--  Mirrors src/data/models.ts. Design notes live in docs/ARCHITECTURE.md › Backend.
--
--  • A household owns everything a family creates. Members reach it through
--    household_members, and row-level security allows access only to members.
--  • Primary keys are the client-generated text ids from newId(), so records
--    created offline or as a guest keep their identity when they sync.
--  • Sync is last-writer-wins per row on updated_at; deletes are tombstones
--    (deleted_at) so they reach every device.
--  • Content (topics, curated entries, journeys, Scripture) ships with the app
--    and is referenced here by id. It is never user data.
--  • Entitlements are written only by the service role (purchase webhooks).
--  • Analytics events carry counts and ids, never names or prayer text, and the
--    table rejects long strings as a second line of defence.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Helpers ────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Households and membership ──────────────────────────────────────────────

create table public.households (
  id          text primary key,
  name        text check (char_length(name) <= 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.household_members (
  household_id  text not null references public.households (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  role          text not null default 'owner' check (role in ('owner', 'member')),
  created_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);
create index household_members_user_idx on public.household_members (user_id);

create or replace function public.is_household_member(h text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = h and m.user_id = auth.uid()
  );
$$;

-- Creates a household for the signed-in user (first sign-in, or guest migration).
create or replace function public.create_household(household_id text, household_name text default null)
returns public.households
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.households;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  insert into public.households (id, name) values (household_id, household_name) returning * into created;
  insert into public.household_members (household_id, user_id, role) values (household_id, auth.uid(), 'owner');
  insert into public.subscriptions (household_id) values (household_id);
  return created;
end;
$$;

-- ── Subscriptions (written only by the service role) ───────────────────────

create table public.subscriptions (
  household_id          text primary key references public.households (id) on delete cascade,
  tier                  text not null default 'free' check (tier in ('free', 'plus')),
  plan                  text check (plan in ('monthly', 'annual')),
  status                text not null default 'none' check (status in ('none', 'trial', 'active', 'canceled')),
  provider              text check (provider in ('app_store', 'play_store', 'stripe')),
  provider_customer_id  text,
  started_at            timestamptz,
  trial_ends_at         timestamptz,
  renews_at             timestamptz,
  updated_at            timestamptz not null default now()
);

create or replace function public.household_is_plus(h text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.household_id = h
      and s.tier = 'plus'
      and s.status in ('trial', 'active')
      and (s.renews_at is null or s.renews_at > now())
  );
$$;

-- ── People ─────────────────────────────────────────────────────────────────

create table public.people (
  id            text primary key,
  household_id  text not null references public.households (id) on delete cascade,
  name          text not null check (char_length(btrim(name)) between 1 and 60),
  relationship  text not null check (relationship in (
                  'son', 'daughter', 'child', 'grandson', 'granddaughter', 'grandchild',
                  'husband', 'wife', 'spouse', 'family', 'mother', 'father', 'parent', 'friend', 'other')),
  age_group     text check (age_group in ('baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult')),
  pronouns      text not null default 'they' check (pronouns in ('he', 'she', 'they')),
  focus_topics  text[] not null default '{}' check (cardinality(focus_topics) <= 8),
  -- A short private note from the parent ("Big math test Thursday").
  concern       text check (char_length(concern) <= 280),
  hue           text not null check (hue in ('sage', 'sky', 'sand', 'rose', 'lavender', 'clay', 'moss', 'gold')),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index people_household_idx on public.people (household_id, sort_order) where deleted_at is null;

-- ── Special dates ──────────────────────────────────────────────────────────

create table public.special_dates (
  id            text primary key,
  household_id  text not null references public.households (id) on delete cascade,
  person_id     text not null references public.people (id) on delete cascade,
  occasion      text not null,
  date          date not null,
  yearly        boolean not null default false,
  note          text check (char_length(note) <= 280),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index special_dates_person_idx on public.special_dates (person_id, date);

-- ── Blessings: one prepared per person per day, cached so it is stable ─────

create table public.blessings (
  id            text primary key,
  household_id  text not null references public.households (id) on delete cascade,
  person_id     text not null references public.people (id) on delete cascade,
  date          date not null,
  entry_id      text not null,
  topic_id      text not null,
  occasion_id   text,
  source        text not null check (source in ('daily', 'library', 'journey', 'search', 'occasion', 'onboarding')),
  journey_id    text,
  journey_day   integer check (journey_day >= 0),
  replaced      boolean not null default false,
  prayed_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index blessings_person_date_idx on public.blessings (person_id, date desc);
create index blessings_household_updated_idx on public.blessings (household_id, updated_at);

-- ── Journal: reflections, prayer requests (and answers), gratitude, notes ──

create table public.journal_entries (
  id            text primary key,
  household_id  text not null references public.households (id) on delete cascade,
  kind          text not null check (kind in ('reflection', 'request', 'gratitude', 'note')),
  -- Removing a person keeps the parent's words and detaches them.
  person_id     text references public.people (id) on delete set null,
  blessing_id   text references public.blessings (id) on delete set null,
  entry_id      text,
  text          text not null check (char_length(text) <= 5000),
  answered_at   timestamptz,
  answer_note   text check (char_length(answer_note) <= 2000),
  -- Path in the private "journal-photos" bucket: <household_id>/<photo id>.jpg
  photo_path    text,
  favorite      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (answered_at is null or kind = 'request')
);
create index journal_household_created_idx on public.journal_entries (household_id, created_at desc);

-- ── Favorites ──────────────────────────────────────────────────────────────

create table public.favorites (
  id            text primary key,
  household_id  text not null references public.households (id) on delete cascade,
  entry_id      text not null,
  person_id     text references public.people (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index favorites_household_idx on public.favorites (household_id) where deleted_at is null;

-- ── Journey progress ───────────────────────────────────────────────────────

create table public.journey_progress (
  id                 text primary key,
  household_id       text not null references public.households (id) on delete cascade,
  journey_id         text not null,
  person_id          text not null references public.people (id) on delete cascade,
  started_at         timestamptz not null default now(),
  completed_days     integer[] not null default '{}',
  last_completed_at  timestamptz,
  finished_at        timestamptz,
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index journey_progress_person_idx on public.journey_progress (person_id);

-- ── Per-user settings and devices ──────────────────────────────────────────

create table public.user_settings (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  -- Mirrors Settings and NotificationPrefs in src/data/models.ts.
  settings       jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  notifications  jsonb not null default '{}'::jsonb check (jsonb_typeof(notifications) = 'object'),
  updated_at     timestamptz not null default now()
);

create table public.push_tokens (
  token         text primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  platform      text not null check (platform in ('ios', 'android', 'web')),
  -- IANA time zone, so reminders arrive at the right local time.
  timezone      text not null,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);
create index push_tokens_user_idx on public.push_tokens (user_id);

-- ── Free-plan limits, enforced on the server as well as in the app ─────────
--  Free: 2 people and 10 favorites (FREE_LIMITS in models.ts). Plus is unlimited.
--  Only brand-new rows are checked, so sync can always update existing ones and a
--  household that leaves Plus keeps everyone it already added.

create or replace function public.enforce_free_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing integer;
begin
  -- Triggers run before row-level security. For anyone outside the household, say
  -- nothing here and let RLS reject the row, so no one can probe another household.
  if not public.is_household_member(new.household_id) then
    return new;
  end if;
  if new.deleted_at is not null or public.household_is_plus(new.household_id) then
    return new;
  end if;
  if tg_table_name = 'people' then
    if exists (select 1 from public.people where id = new.id) then
      return new;
    end if;
    select count(*) into existing from public.people
      where household_id = new.household_id and deleted_at is null;
    if existing >= 2 then
      raise exception 'free_limit_people' using errcode = 'P0001', hint = 'Bless Them+ adds unlimited people.';
    end if;
  elsif tg_table_name = 'favorites' then
    if exists (select 1 from public.favorites where id = new.id) then
      return new;
    end if;
    select count(*) into existing from public.favorites
      where household_id = new.household_id and deleted_at is null;
    if existing >= 10 then
      raise exception 'free_limit_favorites' using errcode = 'P0001', hint = 'Bless Them+ keeps unlimited favorites.';
    end if;
  end if;
  return new;
end;
$$;

create trigger people_free_limit before insert on public.people
  for each row execute function public.enforce_free_limits();
create trigger favorites_free_limit before insert on public.favorites
  for each row execute function public.enforce_free_limits();

-- ── updated_at maintenance ─────────────────────────────────────────────────

create trigger households_updated_at before update on public.households for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger people_updated_at before update on public.people for each row execute function public.set_updated_at();
create trigger special_dates_updated_at before update on public.special_dates for each row execute function public.set_updated_at();
create trigger blessings_updated_at before update on public.blessings for each row execute function public.set_updated_at();
create trigger journal_entries_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();
create trigger favorites_updated_at before update on public.favorites for each row execute function public.set_updated_at();
create trigger journey_progress_updated_at before update on public.journey_progress for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

-- ── Row-level security ─────────────────────────────────────────────────────

alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.people            enable row level security;
alter table public.special_dates     enable row level security;
alter table public.blessings         enable row level security;
alter table public.journal_entries   enable row level security;
alter table public.favorites         enable row level security;
alter table public.journey_progress  enable row level security;
alter table public.user_settings     enable row level security;
alter table public.push_tokens       enable row level security;

-- Households are created through create_household(); members can read and rename them.
create policy "members read their household" on public.households
  for select to authenticated using (public.is_household_member(id));
create policy "members rename their household" on public.households
  for update to authenticated using (public.is_household_member(id)) with check (public.is_household_member(id));

-- Members see who else belongs to their household. Invitations (V2) go through a function.
create policy "members read membership" on public.household_members
  for select to authenticated using (user_id = auth.uid() or public.is_household_member(household_id));

-- Entitlements: read-only for members. Only the service role (webhooks) writes.
create policy "members read their subscription" on public.subscriptions
  for select to authenticated using (public.is_household_member(household_id));

-- Household data: full access for members, nothing for anyone else.
create policy "members manage people" on public.people
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members manage special dates" on public.special_dates
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members manage blessings" on public.blessings
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members manage journal" on public.journal_entries
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members manage favorites" on public.favorites
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "members manage journeys" on public.journey_progress
  for all to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));

-- Personal rows.
create policy "users manage their settings" on public.user_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage their devices" on public.push_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;
revoke execute on function public.create_household(text, text) from public, anon;
grant execute on function public.create_household(text, text) to authenticated;

-- ── Journal photos: private bucket, one folder per household ───────────────

insert into storage.buckets (id, name, public)
values ('journal-photos', 'journal-photos', false)
on conflict (id) do nothing;

create policy "members read household photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'journal-photos' and public.is_household_member((storage.foldername(name))[1]));
create policy "members add household photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'journal-photos' and public.is_household_member((storage.foldername(name))[1]));
create policy "members remove household photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'journal-photos' and public.is_household_member((storage.foldername(name))[1]));

-- ── Product analytics sink (optional; PostHog works too) ───────────────────
--  Events are tied to a random install id, not to an account. Inserts only,
--  through the API; nobody can read events back except the service role.

create or replace function public.event_props_are_safe(props jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(props) = 'object'
     and not exists (
       select 1 from jsonb_each(props) as p(key, value)
       where jsonb_typeof(p.value) not in ('string', 'number', 'boolean', 'null')
          or (jsonb_typeof(p.value) = 'string' and char_length(p.value #>> '{}') > 40)
     );
$$;

create table public.product_events (
  id           bigint generated always as identity primary key,
  install_id   text not null check (char_length(install_id) <= 40),
  name         text not null check (name ~ '^[a-z_]{3,40}$'),
  props        jsonb not null default '{}'::jsonb check (public.event_props_are_safe(props)),
  occurred_at  timestamptz not null,
  received_at  timestamptz not null default now()
);
create index product_events_name_time_idx on public.product_events (name, occurred_at);

alter table public.product_events enable row level security;
create policy "anyone can send events" on public.product_events
  for insert to anon, authenticated with check (true);
revoke all on public.product_events from anon, authenticated;
grant insert (install_id, name, props, occurred_at) on public.product_events to anon, authenticated;

-- ── Account deletion ───────────────────────────────────────────────────────
--  An Edge Function (service role) handles "Delete account": it removes the user's
--  photos from storage, deletes households where they are the only member, then calls
--  auth.admin.deleteUser(). Foreign keys cascade everything else.
