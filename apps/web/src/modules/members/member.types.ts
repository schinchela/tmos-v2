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

export type MemberProfile = MemberSummary;

export interface CreateMemberInput {
  memberNumber?: string;
  toastmastersId?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  recognitionSuffix?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  membershipStatus?: string;
  joinDate?: string;
  renewalDate?: string;
  mentorMemberId?: string;
  sponsorMemberId?: string;
  pathwayName?: string;
  pathwayLevel?: number;
  activeOfficerRole?: string;
  notes?: string;
}
