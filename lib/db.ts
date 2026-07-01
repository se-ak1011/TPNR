import { supabase } from './supabase';
import {
  ApplicationStatus,
  ConditionRating,
  ContactRole,
  CurrentTenancy,
  DepositScheme,
  DepositStatus,
  DocumentChecklist,
  InventoryItem,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
  MovingChecklistItem,
  MovingPhase,
  PropertyApplication,
  PropertyContact,
  TenantPassport,
} from '@/types';

// ── Mappers ──────────────────────────────────────────────────

function toPassport(row: Record<string, any>): TenantPassport {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    currentAddress: row.current_address,
    desiredMoveInDate: row.desired_move_in_date,
    employmentStatus: row.employment_status,
    employer: row.employer ?? undefined,
    jobTitle: row.job_title ?? undefined,
    annualIncome: row.annual_income ?? undefined,
    monthlyBudget: row.monthly_budget ?? undefined,
    hasGuarantor: row.has_guarantor,
    guarantorName: row.guarantor_name ?? undefined,
    guarantorRelationship: row.guarantor_relationship ?? undefined,
    hasPets: row.has_pets,
    petDetails: row.pet_details ?? undefined,
    hasChildren: row.has_children,
    numberOfDependants: row.number_of_dependants ?? 0,
    smokingStatus: row.smoking_status,
    rightToRent: row.right_to_rent,
    rightToRentExpiry: row.right_to_rent_expiry ?? undefined,
    hasReferences: row.has_references,
    referenceDetails: row.reference_details ?? undefined,
    notesForAgent: row.notes_for_agent ?? undefined,
    documents: {
      photoId: row.doc_photo_id,
      proofOfAddress: row.doc_proof_of_address,
      bankStatements: row.doc_bank_statements,
      employmentContract: row.doc_employment_contract,
      payslips: row.doc_payslips,
      references: row.doc_references,
    },
    isComplete: row.is_complete,
    completedAt: row.completed_at ?? undefined,
  };
}

function toApplication(row: Record<string, any>): PropertyApplication {
  return {
    id: row.id,
    passportId: row.user_id,
    propertyAddress: row.property_address,
    propertyRef: row.property_ref ?? undefined,
    agentName: row.agent_name ?? undefined,
    agencyName: row.agency_name ?? undefined,
    monthlyRent: row.monthly_rent ?? undefined,
    status: row.status as ApplicationStatus,
    submittedAt: row.submitted_at ?? undefined,
    updatedAt: (row.updated_at as string).slice(0, 10),
    notes: row.notes ?? undefined,
    agentNotes: row.agent_notes ?? undefined,
  };
}

function toMaintenance(row: Record<string, any>): MaintenanceRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as MaintenanceCategory,
    priority: row.priority as MaintenancePriority,
    status: row.status as MaintenanceStatus,
    loggedAt: row.logged_at,
    updatedAt: (row.updated_at as string).slice(0, 10),
    landlordResponse: row.landlord_response ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

function toInventoryItem(row: Record<string, any>): InventoryItem {
  return {
    id: row.id,
    room: row.room,
    item: row.item,
    condition: row.condition as ConditionRating,
    notes: row.notes ?? undefined,
    photoTaken: row.photo_taken,
    checkedAt: row.checked_at,
  };
}

function toContact(row: Record<string, any>): PropertyContact {
  return {
    id: row.id,
    name: row.name,
    role: row.role as ContactRole,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function toChecklistItem(row: Record<string, any>): MovingChecklistItem {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    actionUrl: row.action_url ?? undefined,
    completed: row.completed,
    duePhase: row.due_phase as MovingPhase,
  };
}

// ── Passport ─────────────────────────────────────────────────

export async function fetchPassport(userId: string): Promise<TenantPassport | null> {
  const { data } = await supabase
    .from('tenant_passports')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ? toPassport(data) : null;
}

export async function savePassportStep(
  userId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await supabase
    .from('tenant_passports')
    .upsert({ user_id: userId, ...fields }, { onConflict: 'user_id' });
}

export async function completePassport(
  userId: string,
  documents: DocumentChecklist,
): Promise<void> {
  await supabase.from('tenant_passports').upsert(
    {
      user_id: userId,
      doc_photo_id: documents.photoId,
      doc_proof_of_address: documents.proofOfAddress,
      doc_bank_statements: documents.bankStatements,
      doc_employment_contract: documents.employmentContract,
      doc_payslips: documents.payslips,
      doc_references: documents.references,
      is_complete: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

// ── Applications ─────────────────────────────────────────────

export async function fetchApplications(userId: string): Promise<PropertyApplication[]> {
  const { data } = await supabase
    .from('property_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(toApplication);
}

export async function fetchApplication(id: string): Promise<PropertyApplication | null> {
  const { data } = await supabase
    .from('property_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data ? toApplication(data) : null;
}

export async function createApplication(
  userId: string,
  fields: {
    propertyAddress: string;
    propertyRef?: string;
    agencyName?: string;
    agentName?: string;
    monthlyRent?: number;
    notes?: string;
    status?: ApplicationStatus;
  },
): Promise<PropertyApplication | null> {
  const { data } = await supabase
    .from('property_applications')
    .insert({
      user_id: userId,
      property_address: fields.propertyAddress,
      property_ref: fields.propertyRef || null,
      agency_name: fields.agencyName || null,
      agent_name: fields.agentName || null,
      monthly_rent: fields.monthlyRent || null,
      notes: fields.notes || null,
      status: fields.status ?? 'draft',
    })
    .select()
    .single();
  return data ? toApplication(data) : null;
}

// ── Tenancy ───────────────────────────────────────────────────

export async function fetchTenancy(userId: string): Promise<CurrentTenancy | null> {
  const [tenancyRes, contactsRes, maintenanceRes, inventoryRes] = await Promise.all([
    supabase.from('tenancies').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('property_contacts').select('*').eq('user_id', userId).order('created_at'),
    supabase
      .from('maintenance_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('room')
      .order('created_at'),
  ]);

  if (!tenancyRes.data) return null;

  const t = tenancyRes.data;
  return {
    propertyAddress: t.property_address,
    tenancyStartDate: t.tenancy_start_date ?? '',
    tenancyEndDate: t.tenancy_end_date ?? '',
    monthlyRent: t.monthly_rent ?? 0,
    depositInfo: {
      amount: t.deposit_amount ?? 0,
      scheme: (t.deposit_scheme ?? 'DPS') as DepositScheme,
      schemeRef: t.deposit_scheme_ref ?? '',
      paidAt: t.deposit_paid_at ?? '',
      propertyAddress: t.property_address,
      landlordName: t.deposit_landlord_name ?? '',
      expectedReturnDate: t.deposit_expected_return_date ?? undefined,
      status: (t.deposit_status ?? 'held') as DepositStatus,
      deductionsClaimed: t.deposit_deductions_claimed ?? undefined,
      deductionsDisputed: t.deposit_deductions_disputed ?? undefined,
    },
    contacts: (contactsRes.data ?? []).map(toContact),
    maintenanceRequests: (maintenanceRes.data ?? []).map(toMaintenance),
    inventoryItems: (inventoryRes.data ?? []).map(toInventoryItem),
  };
}

// ── Maintenance ───────────────────────────────────────────────

export async function createMaintenanceRequest(
  userId: string,
  fields: {
    title: string;
    description: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
  },
): Promise<void> {
  await supabase.from('maintenance_requests').insert({
    user_id: userId,
    title: fields.title,
    description: fields.description,
    category: fields.category,
    priority: fields.priority,
    status: 'logged',
    logged_at: new Date().toISOString().slice(0, 10),
  });
}

// ── Moving checklist ──────────────────────────────────────────

const DEFAULT_CHECKLIST: Omit<MovingChecklistItem, 'id'>[] = [
  { category: 'Broadband', title: 'Order broadband', description: 'Order 3–4 weeks before move-in to avoid a 2-week engineer wait.', completed: false, duePhase: 'before_move' },
  { category: 'Utilities', title: 'Set up energy account', description: 'Contact your supplier or switch to a new one before move-in date.', completed: false, duePhase: 'before_move' },
  { category: 'Moving', title: 'Book removal van', description: 'Book at least 2 weeks ahead, especially for weekends.', completed: false, duePhase: 'before_move' },
  { category: 'Documents', title: 'Get tenancy agreement signed', description: 'Both you and the landlord/agent must sign before you receive keys.', completed: false, duePhase: 'before_move' },
  { category: 'Keys & Access', title: 'Receive and test all keys', description: 'Test every lock, communal door, and mailbox key.', completed: false, duePhase: 'move_day' },
  { category: 'Inventory', title: 'Complete move-in inventory', description: 'Photograph every room, note all existing damage, send to landlord with read receipt.', completed: false, duePhase: 'move_day' },
  { category: 'Meters', title: 'Take meter readings', description: 'Gas, electricity, and water. Send to your supplier and keep a copy.', completed: false, duePhase: 'move_day' },
  { category: 'Council Tax', title: 'Register for council tax', description: "Contact your local council — you're liable from move-in day.", actionUrl: 'https://www.gov.uk/pay-council-tax', completed: false, duePhase: 'first_week' },
  { category: 'Address Changes', title: 'Update your bank', description: 'Update your address with your bank and any financial providers.', completed: false, duePhase: 'first_week' },
  { category: 'Address Changes', title: 'Update DVLA', description: 'Update your driving licence and/or V5C logbook.', actionUrl: 'https://www.gov.uk/change-address-driving-licence', completed: false, duePhase: 'first_week' },
  { category: 'Address Changes', title: 'Update voter registration', description: 'Register or update your address on the electoral roll.', actionUrl: 'https://www.gov.uk/register-to-vote', completed: false, duePhase: 'first_week' },
  { category: 'Address Changes', title: 'Register with a local GP', description: 'Register with a GP surgery near your new address.', actionUrl: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/', completed: false, duePhase: 'first_week' },
  { category: 'Address Changes', title: 'Notify HMRC', description: "Update your address if you're employed or self-employed.", actionUrl: 'https://www.gov.uk/tell-hmrc-change-of-details', completed: false, duePhase: 'first_month' },
  { category: 'Insurance', title: 'Set up contents insurance', description: "Protect your belongings — landlord insurance doesn't cover your property.", completed: false, duePhase: 'first_month' },
  { category: 'Address Changes', title: 'Set up post redirection', description: 'Set up Royal Mail redirection from your old address.', actionUrl: 'https://www.royalmail.com/personal/receiving-mail/redirection', completed: false, duePhase: 'first_month' },
];

export async function fetchChecklist(userId: string): Promise<MovingChecklistItem[]> {
  const { data } = await supabase
    .from('moving_checklist_items')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');

  if (data && data.length > 0) return data.map(toChecklistItem);

  // First load: seed the default checklist
  const rows = DEFAULT_CHECKLIST.map((item, idx) => ({
    user_id: userId,
    category: item.category,
    title: item.title,
    description: item.description,
    action_url: item.actionUrl ?? null,
    completed: false,
    due_phase: item.duePhase,
    sort_order: idx,
  }));
  const { data: inserted } = await supabase
    .from('moving_checklist_items')
    .insert(rows)
    .select();
  return (inserted ?? []).map(toChecklistItem);
}

export async function toggleChecklistItem(id: string, completed: boolean): Promise<void> {
  await supabase.from('moving_checklist_items').update({ completed }).eq('id', id);
}

export async function fetchMaintenanceRequests(userId: string): Promise<MaintenanceRequest[]> {
  const { data } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(toMaintenance);
}

export async function fetchContacts(userId: string): Promise<PropertyContact[]> {
  const { data } = await supabase
    .from('property_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  return (data ?? []).map(toContact);
}

export async function fetchInventory(userId: string): Promise<InventoryItem[]> {
  const { data } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .order('room')
    .order('created_at');
  return (data ?? []).map(toInventoryItem);
}

// ── Application status ordering (UI constant) ────────────────

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'draft',
  'submitted',
  'viewed',
  'shortlisted',
  'viewing_invited',
  'accepted',
  'not_selected',
];
