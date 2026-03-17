import type { AdminCase } from '../../models/admin-case';
import { requestJson } from '../api/apiClient';

type DeleteCaseResponse = {
  id: string;
  deleted: boolean;
};

export async function fetchAdminCases(): Promise<AdminCase[]> {
  return requestJson<AdminCase[]>('/admin/cases');
}

export async function fetchAdminCaseById(caseId: string): Promise<AdminCase> {
  return requestJson<AdminCase>(`/admin/cases/${caseId}`);
}

export async function createAdminCase(payload: AdminCase): Promise<AdminCase> {
  return requestJson<AdminCase>('/admin/cases', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminCase(caseId: string, payload: Partial<AdminCase>): Promise<AdminCase> {
  return requestJson<AdminCase>(`/admin/cases/${caseId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteAdminCase(caseId: string): Promise<DeleteCaseResponse> {
  return requestJson<DeleteCaseResponse>(`/admin/cases/${caseId}`, {
    method: 'DELETE',
  });
}
