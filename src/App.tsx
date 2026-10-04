import { useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customers, initialComplaints, lots, products, statusLabels, type Complaint, type ComplaintStatus } from './data';

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: '▦' },
  { label: 'Reclamações', to: '/reclamacoes', icon: '▤' },
  { label: 'Investigações', to: '/investigacoes', icon: '◷' },
  { label: 'Ações corretivas', to: '/acoes-corretivas', icon: '✓' },
  { label: 'Clientes', to: '/clientes', icon: '♧' },
  { label: 'Produtos', to: '/produtos', icon: '▥' },
  { label: 'Lotes', to: '/lotes', icon: '▨' },
];
const adminNav = [{ label: 'Usuários', to: '/usuarios', icon: '♙' }, { label: 'Auditoria IA', to: '/auditoria-ia', icon: '⌁' }];
const workspaceTabs = [
  { label: 'Visão geral', suffix: '' }, { label: 'Evidências', suffix: '/evidencias' },
  { label: 'Investigação', suffix: '/investigacao' }, { label: 'Ações corretivas', suffix: '/acoes-corretivas' },
  { label: 'QualityOps AI', suffix: '/qualityops-ai' }, { label: 'Sugestões da IA', suffix: '/sugestoes' },
  { label: 'Casos semelhantes', suffix: '/casos-semelhantes' }, { label: 'Histórico', suffix: '/historico' },
];

function Badge({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'blue' | 'amber' | 'red' | 'gray' }) { return <span className={`badge ${tone}`}>{children}</span>; }
function Status({ status }: { status: ComplaintStatus }) { const tone = status === 'INVESTIGATING' ? 'blue' : status === 'UNDER_ANALYSIS' ? 'amber' : status === 'OPEN' ? 'teal' : 'gray'; return <Badge tone={tone}>{statusLabels[status]}</Badge>; }
function Panel({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) { return <section className={`panel ${className}`}><div className="panel-head"><h2>{title}</h2>{action}</div><div className="panel-body">{children}</div></section>; }
function MockNote() { return <span className="mock-note">Prévia visual · dados demonstrativos</span>; }

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <Link className="brand" to="/dashboard" onClick={() => setMenuOpen(false)}><span className="brand-mark">✦</span><span>QualityOps <b>AI</b></span></Link>
      <div className="nav-label">OPERAÇÃO</div>
      <nav>{nav.map(item => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="nav-label">ADMINISTRAÇÃO</div><nav>{adminNav.map(item => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>)}</nav><div className="sidebar-foot"><span className="avatar">MC</span><span><strong>Marina Costa</strong><small>Analista · demonstração</small></span></div></div>
    </aside>
    {menuOpen && <button className="scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
    <div className="main-area"><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">☰</button><div className="topbar-crumb">QualityOps AI <span>/</span> Operação de qualidade</div><div className="topbar-right"><MockNote /><span className="topbar-avatar">MC</span></div></header><main className="content"><Outlet /></main></div>
  </div>;
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <div className="login-page"><div className="login-brand"><div className="login-logo">✦ QualityOps AI</div><h1>Qualidade com clareza em cada decisão.</h1><p>Gestão de qualidade com controle, rastreabilidade e apoio à investigação.</p><span>PRÉVIA VISUAL</span></div><div className="login-form-wrap"><div className="login-form"><Badge>AMBIENTE DEMONSTRATIVO</Badge><h2>Acesse sua conta</h2><p>Explore a estrutura visual do QualityOps AI.</p><form onSubmit={e => { e.preventDefault(); navigate('/dashboard'); }}><label>E-mail<input type="email" placeholder="seu.email@empresa.com" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Senha<input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} /></label><button className="btn primary full" type="submit">Entrar na demonstração <span>→</span></button></form><small>Nenhuma autenticação ou credencial é processada nesta prévia.</small></div></div></div>;
}

function Dashboard({ complaints }: { complaints: Complaint[] }) {
  return <><div className="page-heading"><div><div className="eyebrow">VISÃO GERAL</div><h1>Bom dia, Marina</h1><p>Itens que precisam de acompanhamento</p></div><Badge tone="amber">3 exigem atenção humana</Badge></div>
    <div className="metrics"><div className="metric"><span>RECLAMAÇÕES ABERTAS</span><strong>24</strong><small>Em acompanhamento</small></div><div className="metric"><span>EM INVESTIGAÇÃO</span><strong>11</strong><small>Análise em andamento</small></div><div className="metric"><span>AÇÕES PENDENTES</span><strong>7</strong><small>Aguardando execução</small></div><div className="metric"><span>AGUARDAM INFORMAÇÃO</span><strong>4</strong><small>Pendente de retorno</small></div></div>
    <Panel title="Reclamações recentes" action={<Link className="text-link" to="/reclamacoes">Ver todas →</Link>}><DataTable headers={['TÍTULO', 'CLIENTE', 'STATUS', 'DATA']} rows={complaints.map(c => [<Link to={`/reclamacoes/${c.id}`} className="row-link">{c.title}</Link>, c.customer, <Status status={c.status} />, c.createdAt])} /></Panel>
  </>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { return <div className="table-scroll"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>; }

function Complaints({ complaints }: { complaints: Complaint[] }) {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('ALL');
  const filtered = useMemo(() => complaints.filter(c => `${c.title} ${c.customer} ${c.lot}`.toLowerCase().includes(query.toLowerCase()) && (status === 'ALL' || c.status === status)), [complaints, query, status]);
  return <><div className="page-heading"><div><div className="eyebrow">OPERAÇÃO / RECLAMAÇÕES</div><h1>Reclamações</h1><p>Registro, busca e acompanhamento dos casos</p></div><Link className="btn primary" to="/reclamacoes/nova">+ Nova reclamação</Link></div><Panel title="Todos os registros" action={<span className="muted">{filtered.length} registros demonstrativos</span>}><div className="filters"><input className="search" placeholder="⌕  Buscar por título, cliente ou lote" value={query} onChange={e => setQuery(e.target.value)} /><select value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">Status: Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><DataTable headers={['TÍTULO', 'CLIENTE', 'PRODUTO', 'LOTE', 'STATUS', 'CRIADA']} rows={filtered.map(c => [<Link className="row-link" to={`/reclamacoes/${c.id}`}>{c.title}</Link>, c.customer, c.product, c.lot || '—', <Status status={c.status} />, c.createdAt])} /></Panel></>;
}

const complaintSchema = z.object({ title: z.string().min(1, 'Informe o título').max(150), description: z.string().min(1, 'Informe a descrição').max(3000), customer: z.string().min(1, 'Selecione o cliente'), product: z.string().min(1, 'Selecione o produto'), lot: z.string() });
type ComplaintForm = z.infer<typeof complaintSchema>;
function NewComplaint({ onCreate }: { onCreate: (data: ComplaintForm) => string }) {
  const navigate = useNavigate(); const { register, handleSubmit, watch, formState: { errors } } = useForm<ComplaintForm>({ resolver: zodResolver(complaintSchema), defaultValues: { title: '', description: '', customer: '', product: '', lot: '' } });
  const chosenProduct = watch('product');
  return <><div className="page-heading"><div><div className="eyebrow">RECLAMAÇÕES / NOVA RECLAMAÇÃO</div><h1>Registrar reclamação</h1><p>Dados iniciais para rastrear o caso</p></div></div><Panel title="Informações da reclamação"><form className="form-grid" onSubmit={handleSubmit(data => navigate(`/reclamacoes/${onCreate(data)}`))}><label className="span-2">Título<input {...register('title')} placeholder="Ex.: Fissura superficial em peça" />{errors.title && <small className="error">{errors.title.message}</small>}</label><label className="span-2">Descrição<textarea {...register('description')} rows={5} placeholder="Descreva a ocorrência observada" />{errors.description && <small className="error">{errors.description.message}</small>}</label><label>Cliente<select {...register('customer')}><option value="">Selecione o cliente</option>{customers.map(c => <option key={c.name}>{c.name}</option>)}</select>{errors.customer && <small className="error">{errors.customer.message}</small>}</label><label>Produto<select {...register('product')}><option value="">Selecione o produto</option>{products.map(p => <option key={p.name}>{p.name}</option>)}</select>{errors.product && <small className="error">{errors.product.message}</small>}</label><label>Lote <span className="optional">(opcional)</span><select {...register('lot')}><option value="">Sem lote</option>{lots.filter(l => !chosenProduct || l.product === chosenProduct).map(l => <option key={l.code}>{l.code}</option>)}</select><small>Lotes relacionados ao produto selecionado</small></label><div className="form-actions span-2"><Link className="btn secondary" to="/reclamacoes">Cancelar</Link><button className="btn primary" type="submit">Registrar na prévia</button></div></form></Panel></>;
}

function Workspace({ complaints }: { complaints: Complaint[] }) {
  const { id = '' } = useParams(); const complaint = complaints.find(c => c.id === id);
  if (!complaint) return <Panel title="Reclamação não encontrada"><p>Este registro não está disponível nos dados demonstrativos.</p><Link className="text-link" to="/reclamacoes">Voltar para reclamações</Link></Panel>;
  const base = `/reclamacoes/${complaint.id}`;
  return <><div className="workspace-heading"><div><div className="eyebrow">DETALHES DA RECLAMAÇÃO · #{complaint.id}</div><h1>{complaint.title}</h1><p>{complaint.customer} <span>·</span> {complaint.product} <span>·</span> {complaint.lot || 'Sem lote'} <span>·</span> Criada em {complaint.createdAt} por {complaint.createdBy}</p></div><Status status={complaint.status} /></div>
    <div className="stepper">{(Object.entries(statusLabels) as [ComplaintStatus, string][]).map(([value, label], i) => <div key={value} className={`step ${i <= Object.keys(statusLabels).indexOf(complaint.status) ? 'done' : ''}`}><span className="step-dot" />{label}</div>)}</div>
    <div className="tabs">{workspaceTabs.map(tab => <NavLink end key={tab.label} to={base + tab.suffix} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>{tab.label}</NavLink>)}</div>
    <WorkspaceContent complaint={complaint} />
  </>;
}

function WorkspaceContent({ complaint }: { complaint: Complaint }) {
  const { '*': rest = '' } = useParams();
  const section = rest;
  if (section === 'evidencias') return <EvidencePanel />;
  if (section === 'investigacao') return <InvestigationPanel />;
  if (section === 'acoes-corretivas') return <ActionsPanel />;
  if (section === 'qualityops-ai') return <AiPanel />;
  if (section === 'sugestoes') return <SuggestionsPanel />;
  if (section === 'casos-semelhantes') return <SimilarPanel />;
  if (section === 'historico') return <HistoryPanel complaint={complaint} />;
  return <><div className="workspace-grid"><EvidencePanel compact /><InvestigationPanel compact /><ActionsPanel compact /><AiPanel compact /><SuggestionsPanel compact /><SimilarPanel compact /></div><div className="workspace-bottom"><Panel title="Visão geral"><div className="detail-grid"><div><small>DESCRIÇÃO</small><strong>{complaint.description}</strong></div><div><small>RESPONSÁVEL PELO REGISTRO</small><strong>{complaint.createdBy}</strong></div></div></Panel><HistoryPanel complaint={complaint} /></div></>;
}

function EvidencePanel({ compact = false }: { compact?: boolean }) { return <Panel title="Evidências" action={<Badge>2 registros</Badge>} className={compact ? '' : 'detail-panel'}><div className="stack"><div className="subcard"><strong>▤ Inspeção visual</strong><p>Peça apresentou fissura superficial após produção · 03/10/2026</p></div><div className="subcard"><strong>▤ Registro da produção</strong><p>Documento de controle do lote · 02/10/2026</p></div></div><div className="soft-note">Arquivo ou URL, autor e data em cada evidência.</div></Panel>; }
function InvestigationPanel({ compact = false }: { compact?: boolean }) { return <Panel title="Investigação" action={<Badge tone="amber">Em andamento</Badge>} className={compact ? '' : 'detail-panel'}><p className="panel-intro">Análise: avaliar registros do lote e parâmetros de resfriamento.</p><div className="subcard"><strong>Causa raiz confirmada pelo analista</strong><p>Em apuração · decisão humana pendente</p></div><div className="meta-line">Criada por Marina Costa · 04/10/2026</div></Panel>; }
function ActionsPanel({ compact = false }: { compact?: boolean }) { return <Panel title="Ações corretivas" action={<Badge>2 ações</Badge>} className={compact ? '' : 'detail-panel'}><div className="stack"><div className="subcard"><strong>Revisar controle de temperatura</strong><p>João Silva · Prazo 15/10/2026</p><Badge tone="amber">Em andamento</Badge></div><div className="subcard"><strong>Atualizar instrução de inspeção</strong><p>Ana Lima · Prazo 20/10/2026</p><Badge tone="gray">Pendente</Badge></div></div></Panel>; }
function AiPanel({ compact = false }: { compact?: boolean }) { return <Panel title="Assistente QualityOps AI" action={<Badge>ANÁLISE DEMONSTRATIVA</Badge>} className={`ai-panel ${compact ? '' : 'detail-panel'}`}><div className="ai-line"><strong>Hipóteses</strong><span>Possível variação no resfriamento</span></div><div className="ai-line"><strong>Informações faltantes</strong><span>Registro ambiental da linha</span></div><div className="ai-line"><strong>Próximos passos</strong><span>Conferir controles do lote</span></div><small>As análises da IA são sugestões de apoio. A decisão final pertence ao analista responsável.</small></Panel>; }
function SuggestionsPanel({ compact = false }: { compact?: boolean }) { const [decision, setDecision] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING'); return <Panel title="Sugestões para revisão" className={compact ? '' : 'detail-panel'}><div className="subcard"><strong>Revisar registros de controle térmico</strong><p><Badge tone={decision === 'PENDING' ? 'amber' : decision === 'ACCEPTED' ? 'teal' : 'red'}>{decision === 'PENDING' ? 'Aguardando revisão' : decision === 'ACCEPTED' ? 'Aceita nesta prévia' : 'Rejeitada nesta prévia'}</Badge></p><div className="inline-actions"><button className="mini-btn accept" onClick={() => setDecision('ACCEPTED')}>Aceitar</button><button className="mini-btn reject" onClick={() => setDecision('REJECTED')}>Rejeitar</button></div></div><div className="soft-note">IA sugere → analista revisa → aceita ou rejeita. Alterações apenas nesta sessão visual.</div></Panel>; }
function SimilarPanel({ compact = false }: { compact?: boolean }) { return <Panel title="Casos semelhantes" className={compact ? '' : 'detail-panel'}><div className="subcard"><strong>Peça apresentou fissura após produção</strong><p>Cliente Orion · Válvula VX-20 · LOT-2026-001</p><Badge tone="gray">Exemplo visual</Badge></div><div className="soft-note">Semelhança semântica não confirma a mesma causa raiz.</div></Panel>; }
function HistoryPanel({ complaint }: { complaint: Complaint }) { return <Panel title="Histórico e rastreabilidade"><div className="timeline"><div><span className="timeline-dot" /><strong>Reclamação registrada</strong><p>{complaint.createdAt} · {complaint.createdBy}</p></div><div><span className="timeline-dot" /><strong>Estado atual: {statusLabels[complaint.status]}</strong><p>Dados demonstrativos do caso</p></div></div></Panel>; }

function Directory({ title, subtitle, headers, rows, searchHint }: { title: string; subtitle: string; headers: string[]; rows: React.ReactNode[][]; searchHint: string }) {
  const [query, setQuery] = useState(''); const filtered = rows.filter(row => row.map(cell => typeof cell === 'string' ? cell : '').join(' ').toLowerCase().includes(query.toLowerCase()));
  return <><div className="page-heading"><div><div className="eyebrow">OPERAÇÃO / {title.toUpperCase()}</div><h1>{title}</h1><p>{subtitle}</p></div></div><Panel title={`Lista de ${title.toLowerCase()}`} action={<span className="muted">{filtered.length} registros demonstrativos</span>}><div className="filters"><input className="search" placeholder={`⌕  ${searchHint}`} value={query} onChange={e => setQuery(e.target.value)} /></div><DataTable headers={headers} rows={filtered} /></Panel></>;
}
function Investigations() { return <Directory title="Investigações" subtitle="Análises relacionadas às reclamações" searchHint="Buscar investigação" headers={['RECLAMAÇÃO', 'CLIENTE', 'STATUS', 'CRIADA']} rows={[[<Link className="row-link" to="/reclamacoes/QO-2026-084/investigacao">#QO-2026-084 · Fissura</Link>, 'Atlas Industrial', <Badge tone="amber">Em andamento</Badge>, '04/10/2026'], [<Link className="row-link" to="/reclamacoes/QO-2026-079/investigacao">#QO-2026-079 · Medida</Link>, 'Orion Peças', <Badge tone="amber">Aguardando informações</Badge>, '02/10/2026']]} />; }
function GeneralActions() { return <Directory title="Ações corretivas" subtitle="Acompanhamento das ações registradas" searchHint="Buscar ação corretiva" headers={['AÇÃO', 'RESPONSÁVEL', 'PRAZO', 'STATUS']} rows={[[<Link className="row-link" to="/reclamacoes/QO-2026-084/acoes-corretivas">Revisar controle de temperatura</Link>, 'João Silva', '15/10/2026', <Badge tone="amber">Em andamento</Badge>], ['Atualizar instrução de inspeção', 'Ana Lima', '20/10/2026', <Badge tone="gray">Pendente</Badge>]]} />; }
function Users() { return <Directory title="Usuários" subtitle="Acesso e perfis · visualização demonstrativa" searchHint="Buscar usuário" headers={['NOME', 'E-MAIL', 'PERFIL', 'STATUS']} rows={[["Marina Costa", "marina@empresa.com", "QUALITY_ANALYST", <Badge>Ativo</Badge>], ["Arthur Lima", "arthur@empresa.com", "ADMIN", <Badge>Ativo</Badge>]]} />; }
function Audit() { return <Directory title="Auditoria da IA" subtitle="Execuções, resultado e responsável · prévia visual" searchHint="Buscar execução" headers={['OPERAÇÃO', 'STATUS', 'MODELO', 'DURAÇÃO', 'USUÁRIO', 'DATA']} rows={[["ANALYSIS", <Badge>SUCCESS</Badge>, "llama3.2", "42,1 s", "Arthur", "04/10/2026"], ["SUGGESTION", <Badge tone="amber">BLOCKED</Badge>, "llama3.2", "18,3 s", "Marina", "03/10/2026"]]} />; }

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const createComplaint = (data: ComplaintForm) => { const id = `QO-2026-${String(85 + complaints.length - initialComplaints.length).padStart(3, '0')}`; setComplaints(previous => [{ ...data, id, status: 'OPEN', createdAt: '04/10/2026', createdBy: 'Marina Costa' }, ...previous]); return id; };
  return <Routes><Route path="/login" element={<Login />} /><Route element={<Shell />}><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard complaints={complaints} />} /><Route path="/reclamacoes" element={<Complaints complaints={complaints} />} /><Route path="/reclamacoes/nova" element={<NewComplaint onCreate={createComplaint} />} /><Route path="/reclamacoes/:id/*" element={<Workspace complaints={complaints} />} /><Route path="/investigacoes" element={<Investigations />} /><Route path="/acoes-corretivas" element={<GeneralActions />} /><Route path="/clientes" element={<Directory title="Clientes" subtitle="Cadastro de clientes" searchHint="Buscar cliente" headers={['NOME', 'DOCUMENTO', 'CONTATO']} rows={customers.map(c => [c.name, c.document, c.contact])} />} /><Route path="/produtos" element={<Directory title="Produtos" subtitle="Catálogo de produtos" searchHint="Buscar produto" headers={['CÓDIGO', 'NOME', 'DESCRIÇÃO']} rows={products.map(p => [p.code, p.name, p.description])} />} /><Route path="/lotes" element={<Directory title="Lotes" subtitle="Rastreabilidade de produção" searchHint="Código ou produto" headers={['CÓDIGO', 'PRODUTO', 'FABRICAÇÃO']} rows={lots.map(l => [l.code, l.product, l.manufacturingDate])} />} /><Route path="/usuarios" element={<Users />} /><Route path="/auditoria-ia" element={<Audit />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes>;
}
