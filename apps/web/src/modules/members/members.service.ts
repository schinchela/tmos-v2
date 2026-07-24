import { apiRequest } from "../../lib/api/apiClient";
import type {
  MemberProfile,
  MemberSummary,
} from "./member.types";

export function listMembers(): Promise<MemberSummary[]> {
  return apiRequest<MemberSummary[]>("/api/members");
}

export function getMemberById(
  memberId: string,
): Promise<MemberProfile> {
  return apiRequest<MemberProfile>(
    `/api/members/${encodeURIComponent(memberId)}`,
  );
}
