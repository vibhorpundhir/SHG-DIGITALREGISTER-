import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { loadMembers, saveMember, deleteMember, loadSHGs, loadVillages, loadGPs, type Member } from "@/lib/store";
import "../components/master-data.css";

export const Route = createFileRoute("/member")({
  head: () => ({ meta: [{ title: "सदस्य — SHG प्रबंधन" }] }),
  component: MemberPage,
});

function MemberPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [shgs] = useState(() => loadSHGs());
  const [villages] = useState(() => loadVillages());
  const [gps] = useState(() => loadGPs());
  const [search, setSearch] = useState("");
  const [filterSHG, setFilterSHG] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", fatherHusbandName: "", mobile: "", address: "", villageId: "", gpId: "", shgId: "", joiningDate: "" });

  const filtered = useMemo(() => {
    let list = members;
    if (filterSHG) list = list.filter((m) => m.shgId === filterSHG);
    if (search) { const s = search.toLowerCase(); list = list.filter((m) => m.name.toLowerCase().includes(s) || m.mobile.includes(s)); }
    return list;
  }, [members, search, filterSHG]);

  const shgMap = useMemo(() => new Map(shgs.map((s) => [s.id, s])), [shgs]);
  const villageMap = useMemo(() => new Map(villages.map((v) => [v.id, v])), [villages]);

  const reload = () => setMembers(loadMembers());

  const openAdd = () => { setForm({ name: "", fatherHusbandName: "", mobile: "", address: "", villageId: "", gpId: "", shgId: "", joiningDate: "" }); setSelected(null); setModal("add"); };
  const openEdit = (m: Member) => { setForm({ name: m.name, fatherHusbandName: m.fatherHusbandName, mobile: m.mobile, address: m.address, villageId: m.villageId, gpId: m.gpId, shgId: m.shgId, joiningDate: m.joiningDate }); setSelected(m); setModal("edit"); };

  const handleSave = () => {
    if (!form.name.trim()) return alert("कृपया नाम भरें");
    saveMember({ id: selected?.id || crypto.randomUUID(), ...form, name: form.name.trim() });
    reload(); setModal(null);
  };

  const handleDelete = (id: string) => { if (confirm("हटाएं?")) { deleteMember(id); reload(); } };

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1><span className="page-icon">👤</span>सदस्य ({members.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ नया सदस्य</button>
      </div>
      <div className="search-bar">
        <input placeholder="🔍 नाम या मोबाइल खोजें..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterSHG} onChange={(e) => setFilterSHG(e.target.value)}>
          <option value="">सभी SHG</option>
          {shgs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">👤</span><p>कोई सदस्य नहीं मिला।</p></div>
      ) : (
        <div className="data-table-wrap" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>नाम</th><th>पिता/पति</th><th>मोबाइल</th><th>SHG</th><th>गाँव</th><th>कार्रवाई</th></tr></thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link to="/member-talpat" search={{ id: m.id }} style={{ fontWeight: 600 }}>
                      {m.name}
                    </Link>
                  </td>
                  <td>{m.fatherHusbandName || "—"}</td>
                  <td>{m.mobile || "—"}</td>
                  <td>{shgMap.get(m.shgId)?.name || "—"}</td>
                  <td>{villageMap.get(m.villageId)?.name || "—"}</td>
                  <td className="actions">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate({ to: "/member-talpat", search: { id: m.id } })}>📊</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{modal === "add" ? "नया सदस्य" : "संपादित करें"}</h3></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>नाम</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>पिता/पति का नाम</label><input className="form-input" value={form.fatherHusbandName} onChange={(e) => setForm({ ...form, fatherHusbandName: e.target.value })} /></div>
                <div className="form-group"><label>मोबाइल</label><input className="form-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
                <div className="form-group"><label>पता</label><input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="form-group">
                  <label>SHG</label>
                  <select className="form-select" value={form.shgId} onChange={(e) => setForm({ ...form, shgId: e.target.value })}>
                    <option value="">— चुनें —</option>
                    {shgs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>गाँव</label>
                  <select className="form-select" value={form.villageId} onChange={(e) => setForm({ ...form, villageId: e.target.value })}>
                    <option value="">— चुनें —</option>
                    {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>ग्राम पंचायत</label>
                  <select className="form-select" value={form.gpId} onChange={(e) => setForm({ ...form, gpId: e.target.value })}>
                    <option value="">— चुनें —</option>
                    {gps.map((gp) => <option key={gp.id} value={gp.id}>{gp.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>शामिल दिनांक</label><input className="form-input" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn btn-primary" onClick={handleSave}>सुरक्षित करें</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
