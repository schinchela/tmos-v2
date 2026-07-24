import { apiRequest } from "../../lib/api/apiClient";
import type { MemberSummary } from "./member.types";

export function listMembers(): Promise<MemberSummary[]> {
  return apiRequest<MemberSummary[]>("/api/members");
}
