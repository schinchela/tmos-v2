export interface MemberSummary {
  id: string;
  memberNumber: string | null;
  toastmastersId: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  recognitionSuffix: string | null;
  email: string | null;
  phone: string | null;
  membershipType: string | null;
  membershipStatus: string;
  joinDate: string | null;
  renewalDate: string | null;
  pathwayName: string | null;
  pathwayLevel: number;
  activeOfficerRole: string | null;
  createdAt: string;
  updatedAt: string;
}
