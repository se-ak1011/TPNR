import { useCallback, useEffect, useState } from 'react';
import {
  agentModeHighlights,
  agentProperties,
  allApplications,
  applicants,
  applicantModeHighlights,
  applicationStatusOrder,
  currentApplicant as mockCurrentApplicant,
} from '@/data/mockData';
import { Applicant, ApplicationStatus, DocumentChecklist, PropertyApplication, TenantPassport } from '@/types';
import { supabase } from '@/lib/supabase';

export {
  applicants,
  allApplications,
  agentProperties,
  applicationStatusOrder,
  applicantModeHighlights,
  agentModeHighlights,
};

const documentKeys: (keyof DocumentChecklist)[] = [
  'photoId',
  'proofOfAddress',
  'bankStatements',
  'employmentContract',
  'payslips',
  'references',
];

type PassportDocuments = Partial<Record<keyof DocumentChecklist, boolean | string | null>>;

function hasDocumentValue(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function mapDocuments(raw: unknown): DocumentChecklist {
  const source = typeof raw === 'object' && raw ? (raw as PassportDocuments) : {};

  return {
    photoId: hasDocumentValue(source.photoId),
    proofOfAddress: hasDocumentValue(source.proofOfAddress),
    bankStatements: hasDocumentValue(source.bankStatements),
    employmentContract: hasDocumentValue(source.employmentContract),
    payslips: hasDocumentValue(source.payslips),
    references: hasDocumentValue(source.references),
  };
}

function mapDocumentPaths(raw: unknown): Partial<Record<keyof DocumentChecklist, string>> {
  const source = typeof raw === 'object' && raw ? (raw as PassportDocuments) : {};

  return documentKeys.reduce<Partial<Record<keyof DocumentChecklist, string>>>((acc, key) => {
    if (typeof source[key] === 'string' && source[key]) {
      acc[key] = source[key];
    }

    return acc;
  }, {});
}

function mapPassportRow(row: Record<string, unknown> | null, userEmail?: string): TenantPassport {
  if (!row) {
    return {
      ...mockCurrentApplicant.passport,
      email: userEmail ?? mockCurrentApplicant.passport.email,
    };
  }

  const fallback = mockCurrentApplicant.passport;

  const read = (snakeCase: string, camelCase?: string) => row[snakeCase] ?? (camelCase ? row[camelCase] : undefined);

  return {
    id: String(read('id') ?? fallback.id),
    fullName: String(read('full_name', 'fullName') ?? fallback.fullName),
    email: String(read('email') ?? userEmail ?? fallback.email),
    phone: String(read('phone') ?? fallback.phone),
    currentAddress: String(read('current_address', 'currentAddress') ?? fallback.currentAddress),
    desiredMoveInDate: String(read('desired_move_in_date', 'desiredMoveInDate') ?? fallback.desiredMoveInDate),
    employmentStatus: String(read('employment_status', 'employmentStatus') ?? fallback.employmentStatus) as TenantPassport['employmentStatus'],
    employer: (read('employer') as string | undefined) ?? fallback.employer,
    jobTitle: (read('job_title', 'jobTitle') as string | undefined) ?? fallback.jobTitle,
    annualIncome: Number(read('annual_income', 'annualIncome') ?? fallback.annualIncome),
    monthlyBudget: Number(read('monthly_budget', 'monthlyBudget') ?? fallback.monthlyBudget),
    hasGuarantor: Boolean(read('has_guarantor', 'hasGuarantor') ?? fallback.hasGuarantor),
    guarantorName: (read('guarantor_name', 'guarantorName') as string | undefined) ?? fallback.guarantorName,
    guarantorRelationship: (read('guarantor_relationship', 'guarantorRelationship') as string | undefined) ?? fallback.guarantorRelationship,
    hasPets: Boolean(read('has_pets', 'hasPets') ?? fallback.hasPets),
    petDetails: (read('pet_details', 'petDetails') as string | undefined) ?? fallback.petDetails,
    hasChildren: Boolean(read('has_children', 'hasChildren') ?? fallback.hasChildren),
    numberOfDependants: Number(read('number_of_dependants', 'numberOfDependants') ?? fallback.numberOfDependants),
    smokingStatus: String(read('smoking_status', 'smokingStatus') ?? fallback.smokingStatus) as TenantPassport['smokingStatus'],
    rightToRent: String(read('right_to_rent', 'rightToRent') ?? fallback.rightToRent) as TenantPassport['rightToRent'],
    rightToRentExpiry: (read('right_to_rent_expiry', 'rightToRentExpiry') as string | undefined) ?? fallback.rightToRentExpiry,
    hasReferences: Boolean(read('has_references', 'hasReferences') ?? fallback.hasReferences),
    referenceDetails: (read('reference_details', 'referenceDetails') as string | undefined) ?? fallback.referenceDetails,
    documents: mapDocuments(read('documents')),
    notesForAgent: (read('notes_for_agent', 'notesForAgent') as string | undefined) ?? fallback.notesForAgent,
    completedAt: (read('completed_at', 'completedAt') as string | undefined) ?? fallback.completedAt,
    isComplete: Boolean(read('is_complete', 'isComplete') ?? fallback.isComplete),
  };
}

function mapApplications(rows: Record<string, unknown>[] | null): PropertyApplication[] {
  if (!rows || rows.length === 0) {
    return mockCurrentApplicant.applications;
  }

  return rows.map((row, index) => ({
    id: String(row.id ?? `application-${index}`),
    passportId: String(row.passport_id ?? row.passportId ?? mockCurrentApplicant.passport.id),
    propertyAddress: String(row.property_address ?? row.propertyAddress ?? 'Unknown address'),
    propertyRef: (row.property_ref as string | undefined) ?? (row.propertyRef as string | undefined),
    agentName: (row.agent_name as string | undefined) ?? (row.agentName as string | undefined),
    agencyName: (row.agency_name as string | undefined) ?? (row.agencyName as string | undefined),
    monthlyRent:
      typeof row.monthly_rent === 'number'
        ? row.monthly_rent
        : typeof row.monthlyRent === 'number'
          ? row.monthlyRent
          : undefined,
    status: String(row.status ?? 'draft') as ApplicationStatus,
    submittedAt: (row.submitted_at as string | undefined) ?? (row.submittedAt as string | undefined),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString().slice(0, 10)),
    notes: (row.notes as string | undefined) ?? undefined,
    agentNotes: (row.agent_notes as string | undefined) ?? (row.agentNotes as string | undefined),
  }));
}

export async function getCurrentApplicantData(): Promise<Applicant> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return mockCurrentApplicant;
    }

    const [{ data: passportRow, error: passportError }, { data: applicationRows, error: applicationsError }] = await Promise.all([
      supabase.from('passports').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    ]);

    if (passportError || applicationsError) {
      return {
        ...mockCurrentApplicant,
        id: user.id,
        passport: {
          ...mockCurrentApplicant.passport,
          email: user.email ?? mockCurrentApplicant.passport.email,
        },
      };
    }

    return {
      id: user.id,
      passport: mapPassportRow(passportRow as Record<string, unknown> | null, user.email),
      applications: mapApplications((applicationRows as Record<string, unknown>[] | null) ?? null),
    };
  } catch {
    return mockCurrentApplicant;
  }
}

export function useCurrentApplicantData() {
  const [applicant, setApplicant] = useState<Applicant>(mockCurrentApplicant);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getCurrentApplicantData();
    setApplicant(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { applicant, loading, refresh };
}

function passportPatchToPayload(patch: Partial<TenantPassport>) {
  const payload: Record<string, unknown> = {};

  if (patch.fullName !== undefined) payload.full_name = patch.fullName;
  if (patch.email !== undefined) payload.email = patch.email;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.currentAddress !== undefined) payload.current_address = patch.currentAddress;
  if (patch.desiredMoveInDate !== undefined) payload.desired_move_in_date = patch.desiredMoveInDate;
  if (patch.employmentStatus !== undefined) payload.employment_status = patch.employmentStatus;
  if (patch.employer !== undefined) payload.employer = patch.employer;
  if (patch.jobTitle !== undefined) payload.job_title = patch.jobTitle;
  if (patch.annualIncome !== undefined) payload.annual_income = patch.annualIncome;
  if (patch.monthlyBudget !== undefined) payload.monthly_budget = patch.monthlyBudget;
  if (patch.hasGuarantor !== undefined) payload.has_guarantor = patch.hasGuarantor;
  if (patch.guarantorName !== undefined) payload.guarantor_name = patch.guarantorName;
  if (patch.guarantorRelationship !== undefined) payload.guarantor_relationship = patch.guarantorRelationship;
  if (patch.hasPets !== undefined) payload.has_pets = patch.hasPets;
  if (patch.petDetails !== undefined) payload.pet_details = patch.petDetails;
  if (patch.hasChildren !== undefined) payload.has_children = patch.hasChildren;
  if (patch.numberOfDependants !== undefined) payload.number_of_dependants = patch.numberOfDependants;
  if (patch.smokingStatus !== undefined) payload.smoking_status = patch.smokingStatus;
  if (patch.rightToRent !== undefined) payload.right_to_rent = patch.rightToRent;
  if (patch.rightToRentExpiry !== undefined) payload.right_to_rent_expiry = patch.rightToRentExpiry;
  if (patch.hasReferences !== undefined) payload.has_references = patch.hasReferences;
  if (patch.referenceDetails !== undefined) payload.reference_details = patch.referenceDetails;
  if (patch.documents !== undefined) payload.documents = patch.documents;
  if (patch.notesForAgent !== undefined) payload.notes_for_agent = patch.notesForAgent;
  if (patch.completedAt !== undefined) payload.completed_at = patch.completedAt;
  if (patch.isComplete !== undefined) payload.is_complete = patch.isComplete;

  return payload;
}

export async function upsertPassport(patch: Partial<TenantPassport>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const payload = {
    user_id: user.id,
    ...passportPatchToPayload(patch),
  };

  await supabase.from('passports').upsert(payload, { onConflict: 'user_id' });
}

export async function saveDocumentPath(documentKey: keyof DocumentChecklist, path: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: currentRow } = await supabase.from('passports').select('documents').eq('user_id', user.id).maybeSingle();
  const currentDocuments = mapDocumentPaths(currentRow?.documents);

  await supabase.from('passports').upsert(
    {
      user_id: user.id,
      documents: {
        ...currentDocuments,
        [documentKey]: path,
      },
    },
    { onConflict: 'user_id' }
  );
}
