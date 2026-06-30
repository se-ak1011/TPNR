-- ============================================================
-- TENANT PASSPORT — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

create type employment_status as enum (
  'employed', 'self_employed', 'unemployed', 'student', 'retired'
);

create type smoking_status as enum (
  'non_smoker', 'smoker', 'outside_only'
);

create type right_to_rent_type as enum (
  'uk_passport', 'eu_settled', 'biometric_residence', 'visa', 'other'
);

create type application_status as enum (
  'draft', 'submitted', 'viewed', 'shortlisted',
  'viewing_invited', 'not_selected', 'accepted'
);

create type maintenance_category as enum (
  'plumbing', 'electrical', 'heating', 'appliance',
  'structural', 'damp_mould', 'other'
);

create type maintenance_priority as enum (
  'low', 'medium', 'high', 'emergency'
);

create type maintenance_status as enum (
  'logged', 'acknowledged', 'in_progress', 'resolved', 'closed'
);

create type condition_rating as enum (
  'excellent', 'good', 'fair', 'poor'
);

create type moving_phase as enum (
  'before_move', 'move_day', 'first_week', 'first_month'
);

create type deposit_scheme as enum (
  'TDS', 'DPS', 'MyDeposits'
);

create type deposit_status as enum (
  'held', 'dispute_raised', 'returned_full', 'returned_partial'
);

create type contact_role as enum (
  'landlord', 'agent', 'emergency', 'utility', 'other'
);

-- ============================================================
-- UTILITY: auto-update updated_at on every row change
-- ============================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TABLE: profiles
-- One row per auth user; auto-created by trigger below.
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: passports
-- The tenant's pre-verified profile; one per user.
-- Monetary values stored as pence (integer) to avoid floats.
-- ============================================================

create table passports (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,

  -- Personal details
  date_of_birth           date,
  current_address         text,
  moved_in_date           date,
  previous_address        text,

  -- Employment
  employment_status       employment_status,
  employer_name           text,
  job_title               text,
  annual_income_pence     integer,
  employment_start_date   date,

  -- Previous tenancy reference
  prev_landlord_name      text,
  prev_landlord_phone     text,
  prev_landlord_email     text,
  reason_for_leaving      text,

  -- Lifestyle
  smoking_status          smoking_status,
  has_pets                boolean not null default false,
  pet_details             text,
  occupants               integer not null default 1,

  -- Right to rent
  right_to_rent_type      right_to_rent_type,
  right_to_rent_expiry    date,

  -- Document upload checklist (true = file uploaded to storage)
  has_photo_id            boolean not null default false,
  has_right_to_rent_doc   boolean not null default false,
  has_proof_of_income     boolean not null default false,
  has_bank_statements     boolean not null default false,
  has_references          boolean not null default false,
  has_credit_check        boolean not null default false,

  -- Credit check (result written by Supabase Edge Function via OpenAI)
  credit_score            integer,
  credit_check_date       timestamptz,
  credit_summary          text,

  -- Shareable link token (generate signed URL from this)
  share_token             uuid unique default gen_random_uuid(),
  share_token_expires     timestamptz,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint passports_user_id_unique unique (user_id)
);

alter table passports enable row level security;

create policy "Users can view own passport"
  on passports for select
  using (auth.uid() = user_id);

create policy "Users can insert own passport"
  on passports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own passport"
  on passports for update
  using (auth.uid() = user_id);

create trigger set_passports_updated_at
  before update on passports
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: applications
-- Properties the tenant has applied for / is tracking.
-- ============================================================

create table applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,

  property_address text not null,
  agent_name       text,
  agent_email      text,
  agent_phone      text,
  monthly_rent_pence integer not null,
  bedrooms         integer,
  status           application_status not null default 'draft',
  applied_at       timestamptz,
  notes            text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table applications enable row level security;

create policy "Users can manage own applications"
  on applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_applications_updated_at
  before update on applications
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: tenancies
-- Current and past tenancies.
-- All child tables (deposits, contacts, maintenance, inventory,
-- checklist) reference this table's id.
-- ============================================================

create table tenancies (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  property_address    text not null,
  tenancy_start_date  date not null,
  tenancy_end_date    date not null,
  monthly_rent_pence  integer not null,
  is_current          boolean not null default true,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table tenancies enable row level security;

create policy "Users can manage own tenancies"
  on tenancies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_tenancies_updated_at
  before update on tenancies
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: deposits
-- ============================================================

create table deposits (
  id                    uuid primary key default gen_random_uuid(),
  tenancy_id            uuid not null references tenancies(id) on delete cascade,

  amount_pence          integer not null,
  scheme                deposit_scheme not null,
  scheme_ref            text not null,
  paid_at               date not null,
  status                deposit_status not null default 'held',
  expected_return_date  date,
  deductions_claimed_pence  integer,
  deductions_disputed_pence integer,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table deposits enable row level security;

create policy "Users can manage own deposits"
  on deposits for all
  using (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  )
  with check (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  );

create trigger set_deposits_updated_at
  before update on deposits
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: contacts
-- ============================================================

create table contacts (
  id          uuid primary key default gen_random_uuid(),
  tenancy_id  uuid not null references tenancies(id) on delete cascade,

  name        text not null,
  role        contact_role not null,
  phone       text,
  email       text,
  notes       text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table contacts enable row level security;

create policy "Users can manage own contacts"
  on contacts for all
  using (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  )
  with check (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  );

create trigger set_contacts_updated_at
  before update on contacts
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: maintenance_requests
-- ============================================================

create table maintenance_requests (
  id                uuid primary key default gen_random_uuid(),
  tenancy_id        uuid not null references tenancies(id) on delete cascade,

  title             text not null,
  description       text not null,
  category          maintenance_category not null,
  priority          maintenance_priority not null,
  status            maintenance_status not null default 'logged',
  landlord_response text,
  resolved_at       timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table maintenance_requests enable row level security;

create policy "Users can manage own maintenance requests"
  on maintenance_requests for all
  using (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  )
  with check (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  );

create trigger set_maintenance_requests_updated_at
  before update on maintenance_requests
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: inventory_items
-- ============================================================

create table inventory_items (
  id          uuid primary key default gen_random_uuid(),
  tenancy_id  uuid not null references tenancies(id) on delete cascade,

  room        text not null,
  item        text not null,
  condition   condition_rating not null,
  notes       text,
  photo_taken boolean not null default false,
  photo_path  text,  -- Storage path: {user_id}/{item_id}.jpg
  checked_at  timestamptz not null default now(),

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table inventory_items enable row level security;

create policy "Users can manage own inventory items"
  on inventory_items for all
  using (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  )
  with check (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  );

create trigger set_inventory_items_updated_at
  before update on inventory_items
  for each row execute procedure handle_updated_at();

-- ============================================================
-- TABLE: moving_checklist_items
-- ============================================================

create table moving_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  tenancy_id  uuid not null references tenancies(id) on delete cascade,

  category    text not null,
  title       text not null,
  description text,
  action_url  text,
  completed   boolean not null default false,
  due_phase   moving_phase not null,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table moving_checklist_items enable row level security;

create policy "Users can manage own checklist items"
  on moving_checklist_items for all
  using (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  )
  with check (
    tenancy_id in (select id from tenancies where user_id = auth.uid())
  );

create trigger set_moving_checklist_items_updated_at
  before update on moving_checklist_items
  for each row execute procedure handle_updated_at();

-- ============================================================
-- STORAGE BUCKETS + RLS
-- Files are stored under {user_id}/ so RLS can enforce ownership
-- ============================================================

insert into storage.buckets (id, name, public)
values ('inventory-photos', 'inventory-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('passport-documents', 'passport-documents', false)
on conflict (id) do nothing;

-- inventory-photos policies
create policy "Users can upload own inventory photos"
  on storage.objects for insert
  with check (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own inventory photos"
  on storage.objects for select
  using (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own inventory photos"
  on storage.objects for delete
  using (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- passport-documents policies
create policy "Users can upload own passport documents"
  on storage.objects for insert
  with check (
    bucket_id = 'passport-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own passport documents"
  on storage.objects for select
  using (
    bucket_id = 'passport-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own passport documents"
  on storage.objects for delete
  using (
    bucket_id = 'passport-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
