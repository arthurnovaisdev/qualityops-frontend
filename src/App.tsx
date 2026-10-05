import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, useAuth } from './auth';
import { errorMessage, formatDateTime, get, type AgentExecution } from './api';
import { Shell, Alert, Badge, DataTable, Empty, PageHeading, Panel, QueryState } from './ui';
import { Dashboard, ComplaintsPage, ComplaintFormPage } from './complaints';
import { Workspace, InvestigationsPage, ActionsPage } from './workspace';
import { CustomersPage, ProductsPage, LotsPage, UsersPage } from './catalog';

const loginSchema = z.object({ email: z.email('Informe um e-mail válido'), password: z.string().min(1, 'Informe a senha') });
type LoginForm = z.infer<typeof loginSchema>;
function Login() {
  const { user, initializing, login } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  if (initializing) return <div className="session-loading">Restaurando sessão…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';
  return <div className="login-page"><div className="login-brand"><div className="login-logo">✦ QualityOps AI</div><h1>Qualidade com clareza em cada decisão.</h1><p>Gestão de qualidade com controle, rastreabilidade e apoio à investigação.</p><span>ACESSO SEGURO</span></div><div className="login-form-wrap"><div className="login-form"><Badge>ACESSO À PLATAFORMA</Badge><h2>Acesse sua conta</h2><p>Entre com suas credenciais de trabalho.</p><form onSubmit={handleSubmit(async values => { setError(''); setPending(true); try { await login(values.email, values.password); navigate(from, { replace: true }); } catch (cause) { setError(axios.isAxiosError(cause) && cause.response?.status === 401 ? 'E-mail ou senha inválidos.' : errorMessage(cause)); } finally { setPending(false); } })}><label>E-mail<input type="email" autoComplete="username" {...register('email')} placeholder="seu.email@empresa.com" />{errors.email && <small className="error">{errors.email.message}</small>}</label><label>Senha<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small className="error">{errors.password.message}</small>}</label><button className="btn primary full" type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'} <span>→</span></button></form><Alert message={error} /></div></div></div>;
}
function AuditPage() {
  const audit = useQuery({ queryKey: ['agent-executions'], queryFn: () => get<AgentExecution[]>('/admin/agent-executions') });
  return <><PageHeading section="ADMINISTRAÇÃO / AUDITORIA IA" title="Auditoria da IA" subtitle="Execuções, resultados e responsável" /><Panel title="Execuções recentes" action={<span className="muted">Até 100 registros</span>}><QueryState loading={audit.isLoading} error={audit.error}>{audit.data?.length ? <DataTable headers={['OPERAÇÃO', 'STATUS', 'USUÁRIO', 'RECLAMAÇÃO', 'MODELO', 'DURAÇÃO', 'DATA/HORA', 'DETALHES']} rows={audit.data.map(execution => [execution.operation, <Badge tone={execution.status === 'SUCCESS' ? 'teal' : execution.status === 'BLOCKED' ? 'amber' : 'red'}>{execution.status}</Badge>, execution.requestedByName, <span title={execution.complaintId}>{execution.complaintTitle}</span>, execution.model || '—', execution.durationMs == null ? '—' : `${execution.durationMs} ms`, formatDateTime(execution.createdAt), <details className="audit-details"><summary>Ver mensagem e resultado</summary><div><strong>Mensagem enviada</strong><p>{execution.userMessage || '—'}</p><strong>Resultado</strong><pre>{execution.output || '—'}</pre></div></details>])} /> : <Empty text="Nenhuma execução da IA registrada." />}</QueryState></Panel></>;
}
function NoAccess() { const { user } = useAuth(); return <><PageHeading section="ACESSO" title="Sem áreas disponíveis" subtitle={`Perfil atual: ${user?.role}`} /><Panel title="Permissões"><p>O backend não concede acesso às áreas operacionais para este perfil. Solicite a um administrador o perfil apropriado.</p></Panel></>; }
function Protected({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) { return <RequireAuth roles={admin ? ['ADMIN'] : ['ADMIN', 'QUALITY_ANALYST']}>{children}</RequireAuth>; }
function WorkspaceRoute() { const { id } = useParams(); return <Workspace key={id} />; }

export default function App() { return <AuthProvider><Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RequireAuth><Shell /></RequireAuth>}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/reclamacoes" element={<Protected><ComplaintsPage /></Protected>} />
    <Route path="/reclamacoes/nova" element={<Protected><ComplaintFormPage /></Protected>} />
    <Route path="/reclamacoes/:id/editar" element={<Protected><ComplaintFormPage edit /></Protected>} />
    <Route path="/reclamacoes/:id/*" element={<Protected><WorkspaceRoute /></Protected>} />
    <Route path="/investigacoes" element={<Protected><InvestigationsPage /></Protected>} />
    <Route path="/acoes-corretivas" element={<Protected><ActionsPage /></Protected>} />
    <Route path="/clientes" element={<Protected><CustomersPage /></Protected>} />
    <Route path="/produtos" element={<Protected><ProductsPage /></Protected>} />
    <Route path="/lotes" element={<Protected><LotsPage /></Protected>} />
    <Route path="/usuarios" element={<Protected admin><UsersPage /></Protected>} />
    <Route path="/auditoria-ia" element={<Protected admin><AuditPage /></Protected>} />
    <Route path="/sem-acesso" element={<RequireAuth><NoAccess /></RequireAuth>} />
  </Route>
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AuthProvider>; }
