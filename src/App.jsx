import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Wrench, Package, Receipt, Plus, X, Search,
  Car, Phone, Mail, Trash2, Check, AlertTriangle, ChevronRight,
  BarChart3, Printer, LogOut, ShieldCheck, History,
} from "lucide-react";
import { subscribeToTallerData, saveTallerData } from "./firebase";

const USER_KEY = "taller_current_user_v1";
const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

const EMPTY = { clients: [], vehicles: [], orders: [], parts: [], invoices: [] };

const STATUS = {
  pendiente: { label: "Pendiente", color: "#8A6D1D", bg: "#FBF0D9" },
  en_progreso: { label: "En progreso", color: "#2E4B6E", bg: "#E3EAF3" },
  completada: { label: "Completada", color: "#3F7D4F", bg: "#E4F1E7" },
};

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

export default function TallerApp() {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [saveErr, setSaveErr] = useState(false);
  const [user, setUser] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  // Suscripción en tiempo real a los datos compartidos del taller
  useEffect(() => {
    const unsub = subscribeToTallerData((remote) => {
      setData(remote ? { ...EMPTY, ...remote } : EMPTY);
      setReady(true);
    });
    return () => unsub && unsub();
  }, []);

  // Usuario actual: guardado localmente en este dispositivo/navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const update = (fn) => {
    setData((d) => {
      const next = fn(structuredClone(d));
      saveTallerData(next).catch(() => setSaveErr(true));
      return next;
    });
  };

  const login = (u) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const isAdmin = user?.role === "admin";

  const navAll = [
    { id: "dashboard", label: "Panel", icon: LayoutDashboard, roles: ["admin", "empleado"] },
    { id: "clientes", label: "Clientes y vehículos", icon: Users, roles: ["admin", "empleado"] },
    { id: "ordenes", label: "Órdenes de trabajo", icon: Wrench, roles: ["admin", "empleado"] },
    { id: "inventario", label: "Inventario", icon: Package, roles: ["admin", "empleado"] },
    { id: "facturacion", label: "Facturación", icon: Receipt, roles: ["admin"] },
    { id: "reportes", label: "Reportes", icon: BarChart3, roles: ["admin"] },
  ];
  const nav = navAll.filter((n) => n.roles.includes(user?.role));

  const rootStyle = { "--ink": "#1B2430", "--steel": "#2E4B6E", "--ochre": "#B8791A", "--bg": "#EEF0F2", "--card": "#FFFFFF", "--line": "#D8DCE1", "--muted": "#5B6472", "--danger": "#B23A2E", "--good": "#3F7D4F" };

  return (
    <div style={rootStyle} className="w-full min-h-screen">
      <style>{`
        .taller-root { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
        .taller-head { font-family: "Arial Narrow", "Helvetica Neue Condensed", ui-sans-serif, sans-serif; letter-spacing: 0.01em; }
        .stamp { border: 2px solid; border-radius: 3px; font-weight: 700; font-size: 11px; padding: 3px 8px; display: inline-block; transform: rotate(-1.5deg); }
        .card { background: var(--card); border: 1px solid var(--line); border-radius: 4px; }
        .btn-primary { background: var(--ochre); color: #fff; border-radius: 3px; font-weight: 600; }
        .btn-primary:hover { background: #a06915; }
        .btn-secondary { background: transparent; border: 1px solid var(--line); color: var(--ink); border-radius: 3px; }
        .btn-secondary:hover { background: #F3F4F6; }
        .input { border: 1px solid var(--line); border-radius: 3px; padding: 7px 10px; font-size: 14px; background: #fff; width: 100%; }
        .input:focus { outline: 2px solid var(--steel); outline-offset: 1px; }
        .navitem { color: #C7CEDA; }
        .navitem.active { background: rgba(255,255,255,0.08); color: #fff; border-left: 3px solid var(--ochre); }
        .navitem:hover { background: rgba(255,255,255,0.06); }
        .mono { font-variant-numeric: tabular-nums; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        .bar-track { background: #E4E7EB; border-radius: 2px; overflow: hidden; }
        .bar-fill { background: var(--steel); }
        .print-area { display: none; }
        @media print {
          .app-shell { display: none !important; }
          .print-area { display: block !important; }
        }
      `}</style>

      <div className="app-shell">
        {!user ? (
          <LoginGate onLogin={login} />
        ) : (
          <div className="taller-root flex w-full min-h-screen">
            <aside style={{ background: "var(--ink)" }} className="w-60 shrink-0 flex flex-col py-5 text-sm">
              <div className="px-5 pb-5 mb-2 border-b border-white/10">
                <div className="taller-head text-white text-xl font-bold leading-tight">Taller Central</div>
                <div className="text-white/40 text-xs mt-1">Gestión de taller</div>
              </div>
              <nav className="flex-1 px-2 space-y-1">
                {nav.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button key={n.id} onClick={() => setTab(n.id)}
                      className={`navitem w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left ${tab === n.id ? "active" : ""}`}>
                      <Icon size={16} />
                      <span>{n.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="px-5 pt-4 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                  <ShieldCheck size={13} />
                  <span>{user.name} · {user.role === "admin" ? "Administrador" : "Empleado"}</span>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs">
                  <LogOut size={12} /> Cambiar usuario
                </button>
                {saveErr && <div className="text-xs mt-2" style={{ color: "#E7A5A0" }}>No se pudo guardar en la base de datos</div>}
              </div>
            </aside>

            <main className="flex-1 p-8 max-w-6xl">
              {!ready ? (
                <div className="text-sm" style={{ color: "var(--muted)" }}>Cargando...</div>
              ) : tab === "dashboard" ? (
                <Dashboard data={data} setTab={setTab} />
              ) : tab === "clientes" ? (
                <Clientes data={data} update={update} isAdmin={isAdmin} />
              ) : tab === "ordenes" ? (
                <Ordenes data={data} update={update} isAdmin={isAdmin} />
              ) : tab === "inventario" ? (
                <Inventario data={data} update={update} isAdmin={isAdmin} />
              ) : tab === "facturacion" ? (
                <Facturacion data={data} update={update} onPrint={setPrintInvoice} />
              ) : (
                <Reportes data={data} />
              )}
            </main>
          </div>
        )}
      </div>

      {printInvoice && (
        <PrintOverlay invoice={printInvoice} data={data} onClose={() => setPrintInvoice(null)} />
      )}
    </div>
  );
}

/* ---------------- Login / roles ---------------- */
function LoginGate({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("empleado");
  return (
    <div className="taller-root min-h-screen flex items-center justify-center">
      <div className="card p-6 w-80">
        <div className="taller-head text-xl font-bold mb-1">Taller Central</div>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Identifícate para continuar</p>
        <input className="input mb-3" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2 mb-4">
          {["empleado", "admin"].map((r) => (
            <button key={r} onClick={() => setRole(r)} className="flex-1 py-1.5 text-sm rounded-sm border"
              style={{ borderColor: role === r ? "var(--steel)" : "var(--line)", background: role === r ? "var(--steel)" : "#fff", color: role === r ? "#fff" : "var(--ink)" }}>
              {r === "admin" ? "Administrador" : "Empleado"}
            </button>
          ))}
        </div>
        <button disabled={!name.trim()} onClick={() => onLogin({ name: name.trim(), role })} className="btn-primary w-full py-2 text-sm disabled:opacity-40">Entrar</button>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="taller-head text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ data, setTab }) {
  const activeOrders = data.orders.filter((o) => o.status !== "completada");
  const lowStock = data.parts.filter((p) => Number(p.stock) <= Number(p.minStock || 0));
  const thisMonth = todayISO().slice(0, 7);
  const monthlyRevenue = data.invoices.filter((i) => i.date?.startsWith(thisMonth) && i.status === "pagada").reduce((s, i) => s + i.total, 0);
  const pendingRevenue = data.invoices.filter((i) => i.status === "pendiente").reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Órdenes activas", value: activeOrders.length, onClick: () => setTab("ordenes") },
    { label: "Clientes", value: data.clients.length, onClick: () => setTab("clientes") },
    { label: "Ingresos del mes", value: money(monthlyRevenue), onClick: () => setTab("facturacion") },
    { label: "Por cobrar", value: money(pendingRevenue), onClick: () => setTab("facturacion") },
  ];

  return (
    <div>
      <SectionTitle title="Panel del taller" subtitle={new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <button key={s.label} onClick={s.onClick} className="card p-4 text-left hover:shadow-sm transition-shadow">
            <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
            <div className="taller-head text-2xl font-bold mt-1">{s.value}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Órdenes en curso</h2>
            <button onClick={() => setTab("ordenes")} className="text-xs flex items-center gap-1" style={{ color: "var(--steel)" }}>Ver todas <ChevronRight size={13} /></button>
          </div>
          {activeOrders.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>No hay órdenes activas.</p>
          ) : (
            <ul className="space-y-2">
              {activeOrders.slice(0, 5).map((o) => {
                const v = data.vehicles.find((v) => v.id === o.vehicleId);
                const s = STATUS[o.status];
                return (
                  <li key={o.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                    <span>{v ? `${v.brand} ${v.model} — ${v.plate}` : "Vehículo"}</span>
                    <span className="stamp" style={{ color: s.color, borderColor: s.color, background: s.bg }}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-1.5">
              <AlertTriangle size={14} style={{ color: "var(--danger)" }} /> Stock bajo
            </h2>
            <button onClick={() => setTab("inventario")} className="text-xs flex items-center gap-1" style={{ color: "var(--steel)" }}>Ver inventario <ChevronRight size={13} /></button>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Todo el inventario está en buen nivel.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <span>{p.name}</span>
                  <span className="mono" style={{ color: "var(--danger)" }}>{p.stock} en stock</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Clientes ---------------- */
function Clientes({ data, update, isAdmin }) {
  const [q, setQ] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [vehicleFormFor, setVehicleFormFor] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);

  const filtered = data.clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  const addClient = (c) => update((d) => { d.clients.push({ id: uid("cl"), ...c }); return d; });
  const addVehicle = (clientId, v) => update((d) => { d.vehicles.push({ id: uid("veh"), clientId, ...v }); return d; });
  const removeClient = (id) => update((d) => { d.clients = d.clients.filter((c) => c.id !== id); d.vehicles = d.vehicles.filter((v) => v.clientId !== id); return d; });
  const removeVehicle = (id) => update((d) => { d.vehicles = d.vehicles.filter((v) => v.id !== id); return d; });

  return (
    <div>
      <SectionTitle title="Clientes y vehículos" subtitle={`${data.clients.length} clientes registrados`}
        action={<button onClick={() => setShowClientForm(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"><Plus size={15} /> Nuevo cliente</button>} />

      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
        <input className="input pl-8" placeholder="Buscar por nombre o teléfono" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {showClientForm && <ClientForm onCancel={() => setShowClientForm(false)} onSave={(c) => { addClient(c); setShowClientForm(false); }} />}

      <div className="space-y-3">
        {filtered.map((c) => {
          const vehicles = data.vehicles.filter((v) => v.clientId === c.id);
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className="card p-4">
              <div className="flex items-center justify-between">
                <button className="flex-1 text-left" onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs flex items-center gap-3 mt-1" style={{ color: "var(--muted)" }}>
                    {c.phone && <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                    <span className="flex items-center gap-1"><Car size={11} />{vehicles.length} vehículo(s)</span>
                  </div>
                </button>
                {isAdmin && <button onClick={() => removeClient(c.id)} className="p-1.5 hover:bg-red-50 rounded" style={{ color: "var(--danger)" }}><Trash2 size={15} /></button>}
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
                  {vehicles.length > 0 && (
                    <table className="w-full text-sm mb-3">
                      <thead>
                        <tr className="text-left text-xs" style={{ color: "var(--muted)" }}>
                          <th className="pb-1.5">Placa</th><th className="pb-1.5">Marca / Modelo</th><th className="pb-1.5">Año</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <>
                            <tr key={v.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                              <td className="py-1.5 mono">{v.plate}</td>
                              <td className="py-1.5">{v.brand} {v.model}</td>
                              <td className="py-1.5">{v.year}</td>
                              <td className="py-1.5 text-right flex items-center justify-end gap-2">
                                <button onClick={() => setHistoryFor(historyFor === v.id ? null : v.id)} className="text-xs flex items-center gap-1" style={{ color: "var(--steel)" }}><History size={12} /> Historial</button>
                                {isAdmin && <button onClick={() => removeVehicle(v.id)} style={{ color: "var(--danger)" }}><Trash2 size={13} /></button>}
                              </td>
                            </tr>
                            {historyFor === v.id && (
                              <tr>
                                <td colSpan={4} className="pb-3">
                                  <VehicleHistory data={data} vehicleId={v.id} />
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {vehicleFormFor === c.id ? (
                    <VehicleForm onCancel={() => setVehicleFormFor(null)} onSave={(v) => { addVehicle(c.id, v); setVehicleFormFor(null); }} />
                  ) : (
                    <button onClick={() => setVehicleFormFor(c.id)} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"><Plus size={13} /> Agregar vehículo</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>No hay clientes que coincidan.</p>}
      </div>
    </div>
  );
}

function VehicleHistory({ data, vehicleId }) {
  const orders = data.orders.filter((o) => o.vehicleId === vehicleId).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (orders.length === 0) return <p className="text-xs" style={{ color: "var(--muted)" }}>Sin servicios registrados para este vehículo.</p>;
  return (
    <div className="rounded p-3" style={{ background: "#F5F6F7" }}>
      <ul className="space-y-2">
        {orders.map((o) => {
          const total = o.items.reduce((s, it) => s + it.qty * it.price, 0) + Number(o.labor || 0);
          const s = STATUS[o.status];
          return (
            <li key={o.id} className="text-sm flex items-center justify-between">
              <div>
                <span className="mono text-xs" style={{ color: "var(--muted)" }}>{o.date}</span> — {o.description}
              </div>
              <div className="flex items-center gap-2">
                <span className="stamp" style={{ color: s.color, borderColor: s.color, background: s.bg }}>{s.label}</span>
                <span className="font-medium">{money(total)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClientForm({ onSave, onCancel }) {
  const [f, setF] = useState({ name: "", phone: "", email: "" });
  return (
    <div className="card p-4 mb-4">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <input className="input" placeholder="Nombre completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" placeholder="Teléfono" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className="input" placeholder="Correo (opcional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button disabled={!f.name} onClick={() => onSave(f)} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-40">Guardar</button>
        <button onClick={onCancel} className="btn-secondary px-3 py-1.5 text-sm">Cancelar</button>
      </div>
    </div>
  );
}

function VehicleForm({ onSave, onCancel }) {
  const [f, setF] = useState({ plate: "", brand: "", model: "", year: "" });
  return (
    <div className="p-3 rounded" style={{ background: "#F5F6F7" }}>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <input className="input" placeholder="Placa" value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value.toUpperCase() })} />
        <input className="input" placeholder="Marca" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} />
        <input className="input" placeholder="Modelo" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        <input className="input" placeholder="Año" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button disabled={!f.plate} onClick={() => onSave(f)} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40">Guardar vehículo</button>
        <button onClick={onCancel} className="btn-secondary px-3 py-1.5 text-xs">Cancelar</button>
      </div>
    </div>
  );
}

/* ---------------- Órdenes de trabajo ---------------- */
function Ordenes({ data, update, isAdmin }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("todas");

  const addOrder = (o) => update((d) => { d.orders.unshift({ id: uid("ot"), date: todayISO(), status: "pendiente", items: [], labor: 0, ...o }); return d; });
  const setStatus = (id, status) => update((d) => { const o = d.orders.find((x) => x.id === id); if (o) o.status = status; return d; });
  const removeOrder = (id) => update((d) => { d.orders = d.orders.filter((o) => o.id !== id); return d; });

  const list = data.orders.filter((o) => filter === "todas" || o.status === filter);

  return (
    <div>
      <SectionTitle title="Órdenes de trabajo" subtitle={`${data.orders.length} órdenes en total`}
        action={<button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"><Plus size={15} /> Nueva orden</button>} />

      <div className="flex gap-2 mb-4">
        {["todas", "pendiente", "en_progreso", "completada"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1 text-xs rounded-full border"
            style={{ borderColor: filter === s ? "var(--steel)" : "var(--line)", background: filter === s ? "var(--steel)" : "#fff", color: filter === s ? "#fff" : "var(--ink)" }}>
            {s === "todas" ? "Todas" : STATUS[s].label}
          </button>
        ))}
      </div>

      {showForm && <OrderForm data={data} onCancel={() => setShowForm(false)} onSave={(o) => { addOrder(o); setShowForm(false); }} />}

      <div className="space-y-3">
        {list.map((o) => {
          const v = data.vehicles.find((v) => v.id === o.vehicleId);
          const c = data.clients.find((c) => c.id === v?.clientId);
          const partsTotal = o.items.reduce((s, it) => s + it.qty * it.price, 0);
          const total = partsTotal + Number(o.labor || 0);
          const s = STATUS[o.status];
          return (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{v ? `${v.brand} ${v.model} — ${v.plate}` : "Vehículo eliminado"}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{c?.name || "Cliente"} · {o.date}</div>
                  <p className="text-sm mt-2">{o.description}</p>
                  {o.items.length > 0 && (
                    <ul className="text-xs mt-2 space-y-0.5" style={{ color: "var(--muted)" }}>
                      {o.items.map((it, i) => <li key={i}>{it.qty}× {it.name} — {money(it.qty * it.price)}</li>)}
                    </ul>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="stamp" style={{ color: s.color, borderColor: s.color, background: s.bg }}>{s.label}</span>
                  <div className="taller-head text-lg font-bold mt-2">{money(total)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
                {Object.keys(STATUS).filter((k) => k !== o.status).map((k) => (
                  <button key={k} onClick={() => setStatus(o.id, k)} className="btn-secondary px-2.5 py-1 text-xs">Marcar {STATUS[k].label.toLowerCase()}</button>
                ))}
                {isAdmin && <button onClick={() => removeOrder(o.id)} className="ml-auto text-xs px-2 py-1" style={{ color: "var(--danger)" }}>Eliminar</button>}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>No hay órdenes en esta categoría.</p>}
      </div>
    </div>
  );
}

function OrderForm({ data, onSave, onCancel }) {
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [labor, setLabor] = useState("");
  const [items, setItems] = useState([]);
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState(1);

  const vehicles = data.vehicles.filter((v) => v.clientId === clientId);

  const addItem = () => {
    const p = data.parts.find((p) => p.id === partId);
    if (!p) return;
    setItems([...items, { name: p.name, price: p.price, qty: Number(qty), partId: p.id }]);
    setPartId(""); setQty(1);
  };

  return (
    <div className="card p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={clientId} onChange={(e) => { setClientId(e.target.value); setVehicleId(""); }}>
          <option value="">Selecciona cliente</option>
          {data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!clientId}>
          <option value="">Selecciona vehículo</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>)}
        </select>
      </div>
      <textarea className="input" placeholder="Descripción del trabajo" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

      <div>
        <div className="text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Repuestos usados</div>
        <div className="flex gap-2 mb-2">
          <select className="input" value={partId} onChange={(e) => setPartId(e.target.value)}>
            <option value="">Selecciona repuesto</option>
            {data.parts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock} disp.)</option>)}
          </select>
          <input className="input w-20" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          <button onClick={addItem} disabled={!partId} className="btn-secondary px-3 text-sm disabled:opacity-40">Añadir</button>
        </div>
        {items.length > 0 && (
          <ul className="text-sm space-y-1">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>{it.qty}× {it.name}</span>
                <span className="flex items-center gap-2">{money(it.qty * it.price)}
                  <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} style={{ color: "var(--danger)" }}><X size={13} /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-40">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Mano de obra ($)</label>
        <input className="input mt-1" type="number" value={labor} onChange={(e) => setLabor(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button disabled={!vehicleId || !description} onClick={() => onSave({ vehicleId, description, labor: Number(labor) || 0, items })} className="btn-primary px-4 py-1.5 text-sm disabled:opacity-40">Crear orden</button>
        <button onClick={onCancel} className="btn-secondary px-4 py-1.5 text-sm">Cancelar</button>
      </div>
    </div>
  );
}

/* ---------------- Inventario ---------------- */
function Inventario({ data, update, isAdmin }) {
  const [showForm, setShowForm] = useState(false);
  const addPart = (p) => update((d) => { d.parts.push({ id: uid("pt"), ...p }); return d; });
  const removePart = (id) => update((d) => { d.parts = d.parts.filter((p) => p.id !== id); return d; });
  const adjustStock = (id, delta) => update((d) => { const p = d.parts.find((p) => p.id === id); if (p) p.stock = Math.max(0, Number(p.stock) + delta); return d; });

  return (
    <div>
      <SectionTitle title="Inventario de repuestos" subtitle={`${data.parts.length} artículos`}
        action={isAdmin && <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"><Plus size={15} /> Nuevo repuesto</button>} />

      {showForm && <PartForm onCancel={() => setShowForm(false)} onSave={(p) => { addPart(p); setShowForm(false); }} />}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={{ color: "var(--muted)", background: "#F5F6F7" }}>
              <th className="p-3">Código</th><th className="p-3">Nombre</th><th className="p-3">Precio</th><th className="p-3">Stock</th><th className="p-3">Mín.</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.parts.map((p) => {
              const low = Number(p.stock) <= Number(p.minStock || 0);
              return (
                <tr key={p.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="p-3 mono">{p.code}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{money(p.price)}</td>
                  <td className="p-3">
                    <span className="mono" style={{ color: low ? "var(--danger)" : "var(--ink)" }}>{p.stock}</span>
                    <button onClick={() => adjustStock(p.id, -1)} className="ml-2 px-1.5 border rounded text-xs" style={{ borderColor: "var(--line)" }}>−</button>
                    <button onClick={() => adjustStock(p.id, 1)} className="ml-1 px-1.5 border rounded text-xs" style={{ borderColor: "var(--line)" }}>+</button>
                  </td>
                  <td className="p-3 mono" style={{ color: "var(--muted)" }}>{p.minStock || 0}</td>
                  <td className="p-3 text-right">{isAdmin && <button onClick={() => removePart(p.id)} style={{ color: "var(--danger)" }}><Trash2 size={14} /></button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.parts.length === 0 && <p className="p-4 text-sm" style={{ color: "var(--muted)" }}>Aún no hay repuestos registrados.</p>}
      </div>
    </div>
  );
}

function PartForm({ onSave, onCancel }) {
  const [f, setF] = useState({ code: "", name: "", price: "", stock: "", minStock: "" });
  return (
    <div className="card p-4 mb-4">
      <div className="grid grid-cols-5 gap-3 mb-3">
        <input className="input" placeholder="Código" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <input className="input col-span-2" placeholder="Nombre del repuesto" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" type="number" placeholder="Precio" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <input className="input" type="number" placeholder="Stock inicial" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
      </div>
      <div className="w-40 mb-3">
        <input className="input" type="number" placeholder="Stock mínimo (alerta)" value={f.minStock} onChange={(e) => setF({ ...f, minStock: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button disabled={!f.name} onClick={() => onSave({ ...f, price: Number(f.price) || 0, stock: Number(f.stock) || 0, minStock: Number(f.minStock) || 0 })} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-40">Guardar</button>
        <button onClick={onCancel} className="btn-secondary px-3 py-1.5 text-sm">Cancelar</button>
      </div>
    </div>
  );
}

/* ---------------- Facturación ---------------- */
function Facturacion({ data, update, onPrint }) {
  const invoiceable = data.orders.filter((o) => o.status === "completada" && !data.invoices.some((i) => i.orderId === o.id));

  const createInvoice = (order) => update((d) => {
    const partsTotal = order.items.reduce((s, it) => s + it.qty * it.price, 0);
    const total = partsTotal + Number(order.labor || 0);
    d.invoices.unshift({ id: uid("fac"), orderId: order.id, date: todayISO(), total, status: "pendiente" });
    return d;
  });
  const setPaid = (id, status) => update((d) => { const i = d.invoices.find((x) => x.id === id); if (i) i.status = status; return d; });

  return (
    <div>
      <SectionTitle title="Facturación y pagos" subtitle={`${data.invoices.length} facturas emitidas`} />

      {invoiceable.length > 0 && (
        <div className="card p-4 mb-6">
          <h2 className="font-semibold text-sm mb-3">Órdenes completadas listas para facturar</h2>
          <ul className="space-y-2">
            {invoiceable.map((o) => {
              const v = data.vehicles.find((v) => v.id === o.vehicleId);
              const c = data.clients.find((c) => c.id === v?.clientId);
              const total = o.items.reduce((s, it) => s + it.qty * it.price, 0) + Number(o.labor || 0);
              return (
                <li key={o.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <span>{c?.name} — {v ? `${v.brand} ${v.model}` : ""} · {money(total)}</span>
                  <button onClick={() => createInvoice(o)} className="btn-primary px-3 py-1 text-xs">Generar factura</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={{ color: "var(--muted)", background: "#F5F6F7" }}>
              <th className="p-3">Factura</th><th className="p-3">Cliente</th><th className="p-3">Fecha</th><th className="p-3">Total</th><th className="p-3">Estado</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.map((inv) => {
              const o = data.orders.find((o) => o.id === inv.orderId);
              const v = data.vehicles.find((v) => v.id === o?.vehicleId);
              const c = data.clients.find((c) => c.id === v?.clientId);
              return (
                <tr key={inv.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="p-3 mono">{inv.id}</td>
                  <td className="p-3">{c?.name || "—"}</td>
                  <td className="p-3">{inv.date}</td>
                  <td className="p-3 font-medium">{money(inv.total)}</td>
                  <td className="p-3">
                    <span className="stamp" style={{
                      color: inv.status === "pagada" ? "var(--good)" : "var(--ochre)",
                      borderColor: inv.status === "pagada" ? "var(--good)" : "var(--ochre)",
                      background: inv.status === "pagada" ? "#E4F1E7" : "#FBF0D9",
                    }}>{inv.status === "pagada" ? "Pagada" : "Pendiente"}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onPrint(inv)} className="btn-secondary px-2 py-1 text-xs flex items-center gap-1"><Printer size={12} /> PDF</button>
                      {inv.status !== "pagada" && (
                        <button onClick={() => setPaid(inv.id, "pagada")} className="btn-secondary px-2 py-1 text-xs flex items-center gap-1"><Check size={12} /> Pagada</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.invoices.length === 0 && <p className="p-4 text-sm" style={{ color: "var(--muted)" }}>Aún no se han emitido facturas.</p>}
      </div>
    </div>
  );
}

function PrintOverlay({ invoice, data, onClose }) {
  const o = data.orders.find((o) => o.id === invoice.orderId);
  const v = data.vehicles.find((v) => v.id === o?.vehicleId);
  const c = data.clients.find((c) => c.id === v?.clientId);
  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="card p-6 w-[480px] max-h-[80vh] overflow-auto" style={{ background: "#fff" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="taller-head text-lg font-bold">Vista previa de factura</h2>
            <button onClick={onClose}><X size={18} /></button>
          </div>
          <InvoiceDoc invoice={invoice} order={o} vehicle={v} client={c} />
          <div className="flex gap-2 mt-5">
            <button onClick={() => window.print()} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"><Printer size={14} /> Imprimir / Guardar PDF</button>
            <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cerrar</button>
          </div>
        </div>
      </div>
      <div className="print-area p-10">
        <InvoiceDoc invoice={invoice} order={o} vehicle={v} client={c} />
      </div>
    </>
  );
}

function InvoiceDoc({ invoice, order, vehicle, client }) {
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#1B2430" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="taller-head text-xl font-bold">Taller Central</div>
          <div className="text-xs" style={{ color: "#5B6472" }}>Factura {invoice.id}</div>
        </div>
        <div className="text-right text-sm">
          <div>Fecha: {invoice.date}</div>
          <div>Estado: {invoice.status === "pagada" ? "Pagada" : "Pendiente"}</div>
        </div>
      </div>
      <div className="text-sm mb-4">
        <div><strong>Cliente:</strong> {client?.name || "—"}</div>
        {client?.phone && <div>{client.phone}</div>}
        {vehicle && <div><strong>Vehículo:</strong> {vehicle.brand} {vehicle.model} — {vehicle.plate}</div>}
      </div>
      {order && (
        <>
          <p className="text-sm mb-2"><strong>Trabajo realizado:</strong> {order.description}</p>
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "#D8DCE1" }}><th className="py-1">Concepto</th><th className="py-1 text-right">Total</th></tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}><td className="py-1">{it.qty}× {it.name}</td><td className="py-1 text-right">{money(it.qty * it.price)}</td></tr>
              ))}
              <tr><td className="py-1">Mano de obra</td><td className="py-1 text-right">{money(order.labor)}</td></tr>
            </tbody>
          </table>
        </>
      )}
      <div className="text-right taller-head text-lg font-bold border-t pt-2" style={{ borderColor: "#D8DCE1" }}>Total: {money(invoice.total)}</div>
    </div>
  );
}

/* ---------------- Reportes ---------------- */
function Reportes({ data }) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const revenueByMonth = months.map((m) => ({
    key: m,
    label: MESES[Number(m.slice(5, 7)) - 1],
    total: data.invoices.filter((i) => i.date?.startsWith(m) && i.status === "pagada").reduce((s, i) => s + i.total, 0),
  }));
  const maxRevenue = Math.max(1, ...revenueByMonth.map((r) => r.total));

  const partCounts = {};
  data.orders.forEach((o) => o.items.forEach((it) => { partCounts[it.name] = (partCounts[it.name] || 0) + it.qty; }));
  const topParts = Object.entries(partCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const descCounts = {};
  data.orders.forEach((o) => { const key = (o.description || "").trim(); if (key) descCounts[key] = (descCounts[key] || 0) + 1; });
  const topDesc = Object.entries(descCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalPagado = data.invoices.filter((i) => i.status === "pagada").reduce((s, i) => s + i.total, 0);
  const totalPendiente = data.invoices.filter((i) => i.status === "pendiente").reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <SectionTitle title="Reportes" subtitle="Resumen de ingresos y actividad del taller" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-xs" style={{ color: "var(--muted)" }}>Total facturado (pagado)</div>
          <div className="taller-head text-2xl font-bold mt-1">{money(totalPagado)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs" style={{ color: "var(--muted)" }}>Total por cobrar</div>
          <div className="taller-head text-2xl font-bold mt-1">{money(totalPendiente)}</div>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-sm mb-4">Ingresos por mes (últimos 6 meses)</h2>
        <div className="flex items-end gap-4 h-32">
          {revenueByMonth.map((r) => (
            <div key={r.key} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-xs mb-1 mono">{r.total > 0 ? money(r.total) : ""}</div>
              <div className="bar-track w-full" style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
                <div className="bar-fill w-full" style={{ height: `${Math.max(4, (r.total / maxRevenue) * 100)}%` }} />
              </div>
              <div className="text-xs mt-1.5 capitalize" style={{ color: "var(--muted)" }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Repuestos más utilizados</h2>
          {topParts.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Sin datos aún.</p> : (
            <ul className="space-y-2">
              {topParts.map(([name, qty]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span>{name}</span><span className="mono" style={{ color: "var(--muted)" }}>{qty} usados</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Servicios más comunes</h2>
          {topDesc.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Sin datos aún.</p> : (
            <ul className="space-y-2">
              {topDesc.map(([desc, count]) => (
                <li key={desc} className="flex items-center justify-between text-sm gap-3">
                  <span className="truncate">{desc}</span><span className="mono shrink-0" style={{ color: "var(--muted)" }}>{count}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
