import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { loadVillages, saveVillage, deleteVillage, loadGPs, findGP, type Village, type GramPanchayat } from "@/lib/store";
import "../components/master-data.css";

export const Route = createFileRoute("/village")({
  head: () => ({ meta: [{ title: "गाँव — SHG प्रबंधन" }] }),
  component: VillagePage,
});

function VillagePage() {
  const [villages, setVillages] = useState<Village[]>(() => loadVillages());
  const [gps] = useState<GramPanchayat[]>(() => loadGPs());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [selected, setSelected] = useState<Village | null>(null);
  const [form, setForm] = useState({ name: "", code: "", gpId: "" });

  const filtered = useMemo(() => {
    if (!search) return villages;
    const s = search.toLowerCase();
    return villages.filter((v) => v.name.toLowerCase().includes(s));
  }, [villages, search]);

  const reload = () => setVillages(loadVillages());

  const openAdd = () => { setForm({ name: "", code: "", gpId: "" }); setSelected(null); setModal("add"); };
  const openEdit = (v: Village) => { setForm({ name: v.name, code: v.code, gpId: v.gpId }); setSelected(v); setModal("edit"); };

  const handleSave = () => {
    if (!form.name.trim()) return alert("कृपया नाम भरें");
    saveVillage({ id: selected?.id || crypto.randomUUID(), name: form.name.trim(), code: form.code.trim(), gpId: form.gpId });
    reload(); setModal(null);
  };

  const handleDelete = (id: string) => { if (confirm("हटाएं?")) { deleteVillage(id); reload(); } };

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1><span className="page-icon">🏘️</span>गाँव ({villages.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ नया गाँव</button>
      </div>
      <div className="search-bar"><input placeholder="🔍 खोजें..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">🏘️</span><p>कोई गाँव नहीं मिला।</p></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>नाम</th><th>कोड</th><th>ग्राम पंचायत</th><th>कार्रवाई</th></tr></thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.code || "—"}</td>
                  <td>{findGP(v.gpId)?.name || "—"}</td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>🗑️</button>
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
            <div className="modal-header"><h3>{modal === "add" ? "नया गाँव" : "संपादित करें"}</h3></div>
            <div className="modal-body">
              <div className="form-group"><label>नाम</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>कोड</label><input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="form-group">
                <label>ग्राम पंचायत</label>
                <select className="form-select" value={form.gpId} onChange={(e) => setForm({ ...form, gpId: e.target.value })}>
                  <option value="">— चुनें —</option>
                  {gps.map((gp) => <option key={gp.id} value={gp.id}>{gp.name}</option>)}
                </select>
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
