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
  creditScore?: number;
  creditScoreUpdatedAt?: string;
  linkedPartnerId?: string;
  linkedPartnerName?: string;
}

export interface PassportInvite {
  id: string;
  inviterName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted';
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

// Full tenant journey types

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'heating'
  | 'appliance'
  | 'structural'
  | 'damp_mould'
  | 'other';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';

export type MaintenanceStatus = 'logged' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  loggedAt: string;
  updatedAt: string;
  landlordResponse?: string;
  resolvedAt?: string;
}

export type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor';

export interface InventoryItem {
  id: string;
  room: string;
  item: string;
  condition: ConditionRating;
  notes?: string;
  photoTaken: boolean;
  checkedAt: string;
}

export type MovingPhase = 'before_move' | 'move_day' | 'first_week' | 'first_month';

export interface MovingChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  actionUrl?: string;
  completed: boolean;
  duePhase: MovingPhase;
}

export type DepositScheme = 'TDS' | 'DPS' | 'MyDeposits';

export type DepositStatus = 'held' | 'dispute_raised' | 'returned_full' | 'returned_partial';

export interface DepositInfo {
  amount: number;
  scheme: DepositScheme;
  schemeRef: string;
  paidAt: string;
  propertyAddress: string;
  landlordName: string;
  expectedReturnDate?: string;
  status: DepositStatus;
  deductionsClaimed?: number;
  deductionsDisputed?: number;
}

export type ContactRole = 'landlord' | 'agent' | 'emergency' | 'utility' | 'other';

export interface PropertyContact {
  id: string;
  name: string;
  role: ContactRole;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CurrentTenancy {
  propertyAddress: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  monthlyRent: number;
  depositInfo: DepositInfo;
  contacts: PropertyContact[];
  maintenanceRequests: MaintenanceRequest[];
  inventoryItems: InventoryItem[];
}
