-- ============================================================
-- Tenant Passport — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── tenant_passports ────────────────────────────────────────
create table public.tenant_passports (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null unique,
  full_name               text not null default '',
  email                   text not null default '',
  phone                   text not null default '',
  current_address         text not null default '',
  desired_move_in_date    text not null default '',
  employment_status       text not null default 'employed',
  employer                text,
  job_title               text,
  annual_income           integer,
  monthly_budget          integer,
  has_guarantor           boolean not null default false,
  guarantor_name          text,
  guarantor_relationship  text,
  has_pets                boolean not null default false,
  pet_details             text,
  has_children            boolean not null default false,
  number_of_dependants    integer default 0,
  smoking_status          text not null default 'non_smoker',
  right_to_rent           text not null default 'uk_citizen',
  right_to_rent_expiry    text,
  has_references          boolean not null default false,
  reference_details       text,
  notes_for_agent         text,
  doc_photo_id            boolean not null default false,
  doc_proof_of_address    boolean not null default false,
  doc_bank_statements     boolean not null default false,
  doc_employment_contract boolean not null default false,
  doc_payslips            boolean not null default false,
  doc_references          boolean not null default false,
  is_complete             boolean not null default false,
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
alter table public.tenant_passports enable row level security;
create policy "own_passport" on public.tenant_passports for all using (auth.uid() = user_id);
create trigger trg_passport_updated before update on public.tenant_passports
  for each row execute function update_updated_at();

-- Auto-create a passport row when someone signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.tenant_passports (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── property_applications ───────────────────────────────────
create table public.property_applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  property_address text not null default '',
  property_ref     text,
  agent_name       text,
  agency_name      text,
  monthly_rent     integer,
  status           text not null default 'draft',
  submitted_at     date,
  notes            text,
  agent_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.property_applications enable row level security;
create policy "own_applications" on public.property_applications for all using (auth.uid() = user_id);
create trigger trg_applications_updated before update on public.property_applications
  for each row execute function update_updated_at();

-- ── tenancies ───────────────────────────────────────────────
-- One active tenancy per user. Deposit info stored inline.
create table public.tenancies (
  id                           uuid primary key default gen_random_uuid(),
  user_id                      uuid references auth.users(id) on delete cascade not null unique,
  property_address             text not null default '',
  tenancy_start_date           date,
  tenancy_end_date             date,
  monthly_rent                 integer,
  deposit_amount               integer,
  deposit_scheme               text,
  deposit_scheme_ref           text,
  deposit_paid_at              date,
  deposit_landlord_name        text,
  deposit_expected_return_date date,
  deposit_status               text default 'held',
  deposit_deductions_claimed   integer,
  deposit_deductions_disputed  integer,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);
alter table public.tenancies enable row level security;
create policy "own_tenancy" on public.tenancies for all using (auth.uid() = user_id);
create trigger trg_tenancies_updated before update on public.tenancies
  for each row execute function update_updated_at();

-- ── property_contacts ───────────────────────────────────────
create table public.property_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  role       text not null,
  phone      text,
  email      text,
  notes      text,
  created_at timestamptz not null default now()
);
alter table public.property_contacts enable row level security;
create policy "own_contacts" on public.property_contacts for all using (auth.uid() = user_id);

-- ── maintenance_requests ────────────────────────────────────
create table public.maintenance_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  title             text not null,
  description       text not null default '',
  category          text not null,
  priority          text not null,
  status            text not null default 'logged',
  logged_at         date not null default current_date,
  landlord_response text,
  resolved_at       date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.maintenance_requests enable row level security;
create policy "own_maintenance" on public.maintenance_requests for all using (auth.uid() = user_id);
create trigger trg_maintenance_updated before update on public.maintenance_requests
  for each row execute function update_updated_at();

-- ── inventory_items ─────────────────────────────────────────
create table public.inventory_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  room        text not null,
  item        text not null,
  condition   text not null,
  notes       text,
  photo_taken boolean not null default false,
  checked_at  date not null default current_date,
  created_at  timestamptz not null default now()
);
alter table public.inventory_items enable row level security;
create policy "own_inventory" on public.inventory_items for all using (auth.uid() = user_id);

-- ── moving_checklist_items ──────────────────────────────────
create table public.moving_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  category    text not null,
  title       text not null,
  description text not null,
  action_url  text,
  completed   boolean not null default false,
  due_phase   text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.moving_checklist_items enable row level security;
create policy "own_checklist" on public.moving_checklist_items for all using (auth.uid() = user_id);

-- ── Credit score & joint passport additions ──────────────────
alter table public.tenant_passports
  add column if not exists credit_score         integer,
  add column if not exists credit_score_updated_at timestamptz,
  add column if not exists linked_partner_id    uuid references auth.users(id),
  add column if not exists linked_partner_name  text;

-- Partner invites (magic-link flow)
create table if not exists public.passport_invites (
  id              uuid primary key default gen_random_uuid(),
  inviter_user_id uuid references auth.users(id) on delete cascade not null,
  inviter_name    text not null default '',
  invitee_email   text not null,
  invitee_name    text,
  status          text not null default 'pending'
    check (status in ('pending', 'accepted')),
  created_at      timestamptz not null default now()
);
alter table public.passport_invites enable row level security;
create policy "own_invites_as_inviter"
  on public.passport_invites for all using (auth.uid() = inviter_user_id);
create policy "own_invites_as_invitee"
  on public.passport_invites for select using (invitee_email = auth.email());

-- Security-definer function: links both passports atomically
create or replace function accept_partner_invite(invite_id uuid)
returns void language plpgsql security definer as $$
declare
  v_invite          record;
  v_invitee_user_id uuid := auth.uid();
  v_invitee_name    text;
begin
  select * into v_invite
  from public.passport_invites
  where id = invite_id
    and invitee_email = auth.email()
    and status = 'pending';

  if not found then
    raise exception 'invite not found or already accepted';
  end if;

  select full_name into v_invitee_name
  from public.tenant_passports
  where user_id = v_invitee_user_id;

  update public.tenant_passports
    set linked_partner_id   = v_invitee_user_id,
        linked_partner_name = coalesce(v_invitee_name, '')
  where user_id = v_invite.inviter_user_id;

  update public.tenant_passports
    set linked_partner_id   = v_invite.inviter_user_id,
        linked_partner_name = coalesce(v_invite.inviter_name, '')
  where user_id = v_invitee_user_id;

  update public.passport_invites
    set status = 'accepted', invitee_name = coalesce(v_invitee_name, '')
  where id = invite_id;
end;
$$;
