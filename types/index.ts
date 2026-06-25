export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'viewed'
  | 'shortlisted'
  | 'viewing_invited'
  | 'not_selected'
  | 'accepted';

export interface TenantPassport {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentAddress: string;
  desiredMoveInDate: string;
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired';
  employer?: string;
  jobTitle?: string;
  annualIncome?: number;
  monthlyBudget?: number;
  hasGuarantor: boolean;
  guarantorName?: string;
  guarantorRelationship?: string;
  hasPets: boolean;
  petDetails?: string;
  hasChildren: boolean;
  numberOfDependants?: number;
  smokingStatus: 'non_smoker' | 'smoker' | 'outdoor_only';
  rightToRent: 'uk_citizen' | 'eu_settled' | 'visa' | 'other';
  rightToRentExpiry?: string;
  hasReferences: boolean;
  referenceDetails?: string;
  documents: DocumentChecklist;
  notesForAgent?: string;
  completedAt?: string;
  isComplete: boolean;
}

export interface DocumentChecklist {
  photoId: boolean;
  proofOfAddress: boolean;
  bankStatements: boolean;
  employmentContract: boolean;
  payslips: boolean;
  references: boolean;
}

export interface PropertyApplication {
  id: string;
  passportId: string;
  propertyAddress: string;
  propertyRef?: string;
  agentName?: string;
  agencyName?: string;
  monthlyRent?: number;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  notes?: string;
  agentNotes?: string;
}

export interface Applicant {
  id: string;
  passport: TenantPassport;
  applications: PropertyApplication[];
}

export interface AgentProperty {
  id: string;
  title: string;
  address: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  status: 'open' | 'viewing' | 'offer_made';
  applicants: string[];
  notes?: string;
}

export type UserMode = 'applicant' | 'agent';
