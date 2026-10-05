import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import { errorMessage, formatDate } from './api';

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: '▦' }, { label: 'Reclamações', to: '/reclamacoes', icon: '▤' },
  { label: 'Investigações', to: '/investigacoes', icon: '◷' }, { label: 'Ações corretivas', to: '/acoes-corretivas', icon: '✓' },
  { label: 'Clientes', to: '/clientes', icon: '♧' }, { label: 'Produtos', to: '/produtos', icon: '▥' }, { label: 'Lotes', to: '/lotes', icon: '▨' },
];
export function Shell() {
  const [menuOpen, setMenuOpen] = useState(false); const [logoutError, setLogoutError] = useState(''); const { user, logout } = useAuth(); const navigate = useNavigate();
  const canOperate = user?.role === 'ADMIN' || user?.role === 'QUALITY_ANALYST';
  return <div className="shell"><aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
    <Link className="brand" to="/dashboard" onClick={() => setMenuOpen(false)}><span className="brand-mark">✦</span><span>QualityOps <b>AI</b></span></Link>
    {canOperate && <><div className="nav-label">OPERAÇÃO</div><nav>{nav.map(item => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>)}</nav></>}
    <div className="sidebar-bottom">{user?.role === 'ADMIN' && <><div className="nav-label">ADMINISTRAÇÃO</div><nav><NavLink to="/usuarios" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">♙</span>Usuários</NavLink><NavLink to="/auditoria-ia" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span className="nav-icon">⌁</span>Auditoria IA</NavLink></nav></>}
      <div className="sidebar-foot"><span className="avatar">{user?.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.role}</small></span></div><button className="logout-button" onClick={async () => { setLogoutError(''); try { await logout(); navigate('/login'); } catch { setLogoutError('Não foi possível encerrar a sessão no servidor. Tente novamente.'); } }}>Sair</button>{logoutError && <small className="error">{logoutError}</small>}</div>
  </aside>{menuOpen && <button className="scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
  <div className="main-area"><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">☰</button><div className="topbar-crumb">QualityOps AI <span>/</span> Operação de qualidade</div><div className="topbar-right"><span className="topbar-avatar">{user?.name.slice(0, 1).toUpperCase()}</span></div></header><main className="content"><Outlet /></main></div></div>;
}
export function Badge({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'blue' | 'amber' | 'red' | 'gray' }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Panel({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) { return <section className={`panel ${className}`}><div className="panel-head"><h2>{title}</h2>{action}</div><div className="panel-body">{children}</div></section>; }
export function PageHeading({ section, title, subtitle, action }: { section: string; title: string; subtitle?: string; action?: React.ReactNode }) { return <div className="page-heading"><div><div className="eyebrow">{section}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }
export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { return <div className="table-scroll"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>; }
export function QueryState({ loading, error, children }: { loading: boolean; error: unknown; children: React.ReactNode }) { if (loading) return <div className="state">Carregando informações…</div>; if (error) return <div className="state error">{errorMessage(error)}</div>; return <>{children}</>; }
export function Empty({ text }: { text: string }) { return <p className="empty-state">{text}</p>; }
export function Alert({ message, success = false }: { message?: string; success?: boolean }) { return message ? <div role="alert" className={`notice ${success ? 'success' : 'error'}`}>{message}</div> : null; }
export function DateText({ value }: { value: string | null | undefined }) { return <>{formatDate(value)}</>; }
