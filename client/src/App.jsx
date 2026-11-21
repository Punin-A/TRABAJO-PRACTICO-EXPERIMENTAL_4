import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const icons = {
  spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
  edit: <><path d="M12 20h9M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>
};
function Icon({ name, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>; }
function Logo() { return <div className="brand"><span className="brand-mark"><Icon name="spark" size={21}/></span><span>taskflow<span className="brand-dot">.</span></span></div>; }

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setPending(true); setError('');
    try {
      const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', body: JSON.stringify(form) });
      onAuth(data);
    } catch (err) { setError(err.message); }
    finally { setPending(false); }
  }
  return <div className="auth-layout">
    <section className="auth-story">
      <div className="story-inner"><Logo/><div className="story-copy"><span className="eyebrow light">TU ESPACIO. TU RITMO.</span><h1>Haz espacio para <em>lo que importa.</em></h1><p>Una forma simple de organizar tus pendientes y ver cómo cada pequeño paso se convierte en progreso.</p><div className="story-visual"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-card"><span className="visual-card-top"><span className="visual-check"><Icon name="check" size={14}/></span>Un día a la vez</span><strong>Hoy es un buen día<br/>para empezar.</strong><div className="visual-progress"><span/></div><small>Tu progreso comienza aquí ✦</small></div></div></div><div className="story-bottom">CLARIDAD PARA CADA DÍA <span>✳</span> HECHO PARA TI</div></div>
    </section>
    <section className="auth-panel"><div className="auth-mobile-logo"><Logo/></div><div className="auth-form-wrap"><span className="eyebrow">BIENVENIDO A TASKFLOW</span><h2>{mode === 'login' ? 'Qué bueno verte de nuevo.' : 'Empieza a organizar tus días.'}</h2><p className="muted">{mode === 'login' ? 'Entra y continúa donde lo dejaste.' : 'Crea tu cuenta gratis en unos segundos.'}</p><div className="auth-switch" role="tablist" aria-label="Tipo de acceso"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => {setMode('login');setError('');}}>Iniciar sesión</button><button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => {setMode('register');setError('');}}>Crear cuenta</button></div><form onSubmit={submit}>{mode === 'register' && <label>Nombre completo<input autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" required maxLength={60}/></label>}<label>Correo electrónico<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" required /></label><label>Contraseña<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" required minLength={mode === 'register' ? 8 : undefined} maxLength={72}/></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary auth-submit" type="submit" disabled={pending}>{pending ? 'Un momento...' : mode === 'login' ? 'Entrar a mi espacio' : 'Crear mi cuenta'} <Icon name="arrow" size={18}/></button></form><p className="auth-footnote">Tus tareas son privadas y solo tú puedes verlas.</p></div><div className="panel-footer">© 2026 Taskflow <span>Organiza. Avanza. Repite.</span></div></section>
  </div>;
}

function TaskDialog({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) { e.preventDefault(); setPending(true); setError(''); try { await onSave({ title: title.trim(), description: description.trim() }); onClose(); } catch (err) { setError(err.message); } finally { setPending(false); } }
  return <div className="dialog-backdrop" onMouseDown={e => { if(e.target === e.currentTarget) onClose(); }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button type="button" className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button><span className="eyebrow">TU PRÓXIMO PASO</span><h2 id="dialog-title">{task ? 'Editar tarea' : 'Nueva tarea'}</h2><p className="muted">Ponle nombre a lo que quieres lograr.</p><form onSubmit={submit}><label>Título<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Terminar el informe" maxLength={120} required /></label><label>Descripción <span className="optional">(opcional)</span><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Añade un poco más de contexto..." maxLength={500} rows={4}/></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="dialog-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button type="submit" className="primary" disabled={pending}>{pending ? 'Guardando...' : task ? 'Guardar cambios' : 'Crear tarea'}</button></div></form></div></div>;
}

function Dashboard({ session, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [dialogTask, setDialogTask] = useState(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api('/tasks', { token: session.token }).then(data => { if(active) setTasks(data.tasks); }).catch(err => { if(active) { if(err.status === 401) onLogout(); else setError(err.message); } }).finally(() => { if(active) setLoading(false); }); return () => { active = false; }; }, [session.token]);
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const visible = useMemo(() => tasks.filter(t => (filter === 'all' || (filter === 'done' ? t.completed : !t.completed)) && (t.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) || t.description.toLocaleLowerCase().includes(query.toLocaleLowerCase()))), [tasks, filter, query]);
  async function saveTask(input) {
    const editing = dialogTask && dialogTask !== null;
    const data = await api(editing ? `/tasks/${dialogTask.id}` : '/tasks', { token: session.token, method: editing ? 'PATCH' : 'POST', body: JSON.stringify(input) });
    setTasks(current => editing ? current.map(t => t.id === data.task.id ? data.task : t) : [data.task, ...current]);
  }
  async function toggleTask(task) { setError(''); try { const data = await api(`/tasks/${task.id}`, { token: session.token, method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) }); setTasks(current => current.map(t => t.id === task.id ? data.task : t)); } catch(err) { setError(err.message); } }
  async function deleteTask(task) { if (!window.confirm(`¿Eliminar “${task.title}”?`)) return; setError(''); try { await api(`/tasks/${task.id}`, { token: session.token, method: 'DELETE' }); setTasks(current => current.filter(t => t.id !== task.id)); } catch(err) { setError(err.message); } }
  const name = session.user.name.split(' ')[0];
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="sidebar-content"><span className="sidebar-label">ESPACIO DE TRABAJO</span><div className="nav-item active"><Icon name="grid" size={19}/> Mi panel</div><span className="sidebar-label task-label">MIS TAREAS</span><button className={`nav-item ${filter === 'all' ? 'nav-selected' : ''}`} onClick={() => setFilter('all')}><Icon name="list" size={19}/> Todas <span className="nav-count">{tasks.length}</span></button><button className={`nav-item ${filter === 'pending' ? 'nav-selected' : ''}`} onClick={() => setFilter('pending')}><span className="nav-circle"/> Pendientes <span className="nav-count">{pending}</span></button><button className={`nav-item ${filter === 'done' ? 'nav-selected' : ''}`} onClick={() => setFilter('done')}><Icon name="check" size={19}/> Completadas <span className="nav-count">{completed}</span></button></div><div className="sidebar-bottom"><div className="mini-note"><span>✦ UN PASO A LA VEZ</span><p>Lo importante es seguir avanzando.</p></div><button className="account" onClick={onLogout} title="Cerrar sesión"><span className="avatar">{name.charAt(0).toUpperCase()}</span><span className="account-name"><strong>{session.user.name}</strong><small>Cerrar sesión</small></span><Icon name="logout" size={18}/></button></div></aside>
    <main className="main-content"><header className="topbar"><span>MI ESPACIO <span className="crumb">/</span> PANEL GENERAL</span><div className="topbar-right"><span className="live-dot"/> Todo listo para avanzar <span className="top-avatar">{name.charAt(0).toUpperCase()}</span></div></header><div className="content-wrap"><div className="welcome"><div><span className="eyebrow">TU DÍA, A TU MANERA</span><h1>Hola, {name} <span className="wave">✳</span></h1><p>Organiza lo que viene. Celebra lo que ya lograste.</p></div><button className="primary new-button" onClick={() => setDialogTask(null)}><Icon name="plus" size={19}/> Nueva tarea</button></div><div className="stats"><div className="stat-card"><span className="stat-icon purple"><Icon name="list" size={21}/></span><div><span>Tareas totales</span><strong>{tasks.length}</strong></div><span className="stat-decoration">01</span></div><div className="stat-card"><span className="stat-icon orange"><span className="stat-circle"/></span><div><span>Por hacer</span><strong>{pending}</strong></div><span className="stat-decoration">02</span></div><div className="stat-card"><span className="stat-icon green"><Icon name="check" size={21}/></span><div><span>Completadas</span><strong>{completed}</strong></div><span className="stat-decoration">03</span></div></div><section className="task-section"><div className="section-head"><div><span className="eyebrow">ENFOQUE DEL DÍA</span><h2>Mis tareas <span className="heading-spark">✦</span></h2></div><span className="task-total">{visible.length} {visible.length === 1 ? 'tarea' : 'tareas'}</span></div><div className="task-toolbar"><div className="filter-tabs"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>Todas</button><button className={filter === 'pending' ? 'selected' : ''} onClick={() => setFilter('pending')}>Pendientes</button><button className={filter === 'done' ? 'selected' : ''} onClick={() => setFilter('done')}>Completadas</button></div><label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar tareas..." aria-label="Buscar tareas" /></label></div>{error && <div className="form-error dashboard-error" role="alert">{error}</div>}<div className="task-list">{loading ? <div className="empty-state">Cargando tus tareas...</div> : visible.length ? visible.map(task => <article className={`task-row ${task.completed ? 'is-done' : ''}`} key={task.id}><button className="task-checkbox" onClick={() => toggleTask(task)} aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}>{task.completed && <Icon name="check" size={15}/>}</button><div className="task-details"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<span>{new Date(task.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div><span className={`task-status ${task.completed ? 'done' : ''}`}>{task.completed ? 'Completada' : 'Pendiente'}</span><div className="task-actions"><button onClick={() => setDialogTask(task)} aria-label={`Editar ${task.title}`} title="Editar"><Icon name="edit" size={18}/></button><button onClick={() => deleteTask(task)} aria-label={`Eliminar ${task.title}`} title="Eliminar"><Icon name="trash" size={18}/></button></div></article>) : <div className="empty-state"><div className="empty-icon"><Icon name="spark" size={29}/></div><h3>{tasks.length === 0 ? 'Tu espacio empieza aquí' : 'No hay tareas para mostrar'}</h3><p>{tasks.length === 0 ? 'Crea tu primera tarea y da el siguiente paso.' : 'Prueba con otro filtro o término de búsqueda.'}</p>{tasks.length === 0 && <button className="primary" onClick={() => setDialogTask(null)}><Icon name="plus" size={17}/> Crear mi primera tarea</button>}</div>}</div></section><footer className="main-footer">Un pequeño avance también cuenta. <span>✦</span></footer></div></main>{dialogTask !== undefined && <TaskDialog task={dialogTask} onClose={() => setDialogTask(undefined)} onSave={saveTask}/>}</div>;
}

export default function App() {
  const [session, setSession] = useState(() => { try { return JSON.parse(sessionStorage.getItem('taskflow-session')); } catch { return null; } });
  const [checking, setChecking] = useState(Boolean(session));
  function logout() { sessionStorage.removeItem('taskflow-session'); setSession(null); setChecking(false); }
  function login(data) { sessionStorage.setItem('taskflow-session', JSON.stringify(data)); setSession(data); setChecking(false); }
  useEffect(() => { if (!session) return; let active = true; api('/auth/me', { token: session.token }).then(data => { if(active) setSession(current => current ? { ...current, user: data.user } : null); }).catch(err => { if(active && err.status === 401) logout(); }).finally(() => { if(active) setChecking(false); }); return () => { active = false; }; }, [session?.token]);
  if (checking) return <div className="loading-screen"><Logo/><span>Preparando tu espacio...</span></div>;
  return session ? <Dashboard session={session} onLogout={logout}/> : <Auth onAuth={login}/>;
}
