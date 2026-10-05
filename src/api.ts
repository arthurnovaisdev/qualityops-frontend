import axios, { AxiosError } from 'axios';

export type Role = 'ADMIN' | 'QUALITY_ANALYST' | 'USER';
export type ComplaintStatus = 'OPEN' | 'UNDER_ANALYSIS' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type InvestigationStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_INFORMATION' | 'COMPLETED';
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type LoginResponse = { id: string; name: string; email: string; role: Role };
export type AuthMeResponse = LoginResponse & { active: boolean };
export type User = LoginResponse & { active: boolean; createdAt: string };
export type Customer = { id: string; name: string; document: string | null; contact: string | null };
export type Product = { id: string; name: string; code: string | null; description: string | null };
export type Lot = { id: string; code: string; productId: string; productName: string; manufacturingDate: string | null; expirationDate: string | null };
export type Complaint = { id: string; title: string; description: string; customerId: string; customerName: string; productId: string; productName: string; lotId: string | null; lotCode: string | null; createdById: string; createdByName: string; status: ComplaintStatus; createdAt: string; updatedAt: string };
export type Evidence = { id: string; complaintId: string; complaintTitle: string; title: string; description: string | null; fileUrl: string | null; createdById: string; createdByName: string; createdAt: string };
export type Investigation = { id: string; complaintId: string; complaintTitle: string; analysis: string | null; rootCause: string | null; status: InvestigationStatus; createdById: string; createdByName: string; createdAt: string; updatedAt: string };
export type CorrectiveAction = { id: string; investigationId: string; description: string; responsibleId: string; responsibleName: string; dueDate: string; status: ActionStatus; createdById: string; createdByName: string; createdAt: string; updatedAt: string; completedAt: string | null };
export type Suggestion = { id: string; complaintId: string; complaintTitle: string; suggestion: string; status: SuggestionStatus; createdAt: string };
export type AgentAnalysis = { complaintId: string; analysis: { hypotheses: string[]; missingInformation: string[]; nextSteps: string[] } };
export type AgentExecution = { id: string; complaintId: string; complaintTitle: string; requestedById: string; requestedByName: string; operation: string; status: string; userMessage: string | null; output: string | null; model: string | null; durationMs: number | null; createdAt: string };

export const complaintLabels: Record<ComplaintStatus, string> = { OPEN: 'Aberta', UNDER_ANALYSIS: 'Em análise', INVESTIGATING: 'Em investigação', RESOLVED: 'Resolvida', CLOSED: 'Fechada' };
export const investigationLabels: Record<InvestigationStatus, string> = { OPEN: 'Aberta', IN_PROGRESS: 'Em andamento', WAITING_INFORMATION: 'Aguardando informações', COMPLETED: 'Concluída' };
export const actionLabels: Record<ActionStatus, string> = { PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluída', OVERDUE: 'Atrasada', CANCELLED: 'Cancelada' };
export const suggestionLabels: Record<SuggestionStatus, string> = { PENDING: 'Aguardando revisão', ACCEPTED: 'Aceita', REJECTED: 'Rejeitada' };
export const nextInvestigation: Record<InvestigationStatus, InvestigationStatus[]> = { OPEN: ['IN_PROGRESS'], IN_PROGRESS: ['WAITING_INFORMATION', 'COMPLETED'], WAITING_INFORMATION: ['IN_PROGRESS'], COMPLETED: [] };
export const nextAction: Record<ActionStatus, ActionStatus[]> = { PENDING: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'], OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] };

// Vite proxies /api during development. Production must route /api on the same origin.
export const http = axios.create({ baseURL: '/api', withCredentials: true, withXSRFToken: true, xsrfCookieName: 'XSRF-TOKEN', xsrfHeaderName: 'X-XSRF-TOKEN' });
export async function ensureCsrf() {
  await http.get<{ token: string }>('/auth/csrf');
  // The SPA CSRF cookie is intentionally readable by the browser. Never read access_token here.
  const cookie = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith('XSRF-TOKEN='));
  if (!cookie) throw new Error('O servidor não disponibilizou o token CSRF. Atualize a página e tente novamente.');
  const value = cookie.slice('XSRF-TOKEN='.length);
  try { return decodeURIComponent(value); } catch { return value; }
}
export async function get<T>(path: string) { const response = await http.get<T>(path); return response.data; }
export async function post<T>(path: string, body: unknown) { const csrfToken = await ensureCsrf(); const response = await http.post<T>(path, body, { headers: { 'X-XSRF-TOKEN': csrfToken } }); return response.data; }
export async function put<T>(path: string, body: unknown) { const csrfToken = await ensureCsrf(); const response = await http.put<T>(path, body, { headers: { 'X-XSRF-TOKEN': csrfToken } }); return response.data; }
export async function patch<T>(path: string, body: unknown) { const csrfToken = await ensureCsrf(); const response = await http.patch<T>(path, body, { headers: { 'X-XSRF-TOKEN': csrfToken } }); return response.data; }
export async function remove(path: string) { const csrfToken = await ensureCsrf(); await http.delete(path, { headers: { 'X-XSRF-TOKEN': csrfToken } }); }
export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Não foi possível concluir a operação. Tente novamente.';
  const status = (error as AxiosError).response?.status;
  if (!status) return 'Não foi possível conectar ao servidor. Verifique se a API está disponível.';
  switch (status) {
    case 400: return 'Solicitação inválida ou bloqueada. Confira os dados e tente novamente.';
    case 401: return 'Sua sessão não está autenticada. Entre novamente.';
    case 403: return 'Acesso negado. Verifique sua permissão ou atualize a página e tente novamente.';
    case 404: return 'O recurso solicitado não foi encontrado.';
    case 409: return 'A operação entrou em conflito com uma regra do sistema. Revise o caso antes de tentar novamente.';
    case 429: return 'Limite de solicitações da IA atingido. Aguarde antes de tentar novamente.';
    case 500: return 'O servidor não conseguiu concluir a operação. Tente novamente mais tarde.';
    case 502: return 'A IA não conseguiu gerar uma resposta válida. Tente novamente mais tarde.';
    default: return 'Não foi possível concluir a operação. Tente novamente.';
  }
}
export function isNotFound(error: unknown) { return axios.isAxiosError(error) && error.response?.status === 404; }
export function formatDate(value: string | null | undefined) { if (!value) return '—'; const date = new Date(value.length === 10 ? `${value}T12:00:00` : value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date); }
export function formatDateTime(value: string | null | undefined) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(date); }
export function safeExternalUrl(value: string | null | undefined) { if (!value) return null; try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; } }
export function todayLocal() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }
