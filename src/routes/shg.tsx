import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSHGs, useVillages, useGPs, api, type SHG } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "../components/master-data.css";

export const Route = createFileRoute("/shg")({
  head: () => ({ meta: [{ title: "SHG समूह — SHG प्रबंधन" }] }),
  component: SHGPage,
});

function SHGPage() {
  const navigate = useNavigate();
  const { data: shgs = [], isLoading: loadingSHGs } = useSHGs();
  const { data: villages = [], isLoading: loadingVillages } = useVillages();
  const { data: gps = [], isLoading: loadingGPs } = useGPs();
  
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: api.saveSHG,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shgs"] }); },
    onError: (err) => alert("सेव करने में त्रुटि: " + err.message)
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteSHG,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shgs"] }); },
    onError: (err) => alert("हटाने में त्रुटि: " + err.message)
  });

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [selected, setSelected] = useState<SHG | null>(null);
  const [form, setForm] = useState({ shgId: "", name: "", villageId: "", gpId: "", formationDate: "" });

  const filtered = useMemo(() => {
    if (!search) return shgs;
    const s = search.toLowerCase();
    return shgs.filter((g) => g.name.toLowerCase().includes(s) || g.shgId.toLowerCase().includes(s));
  }, [shgs, search]);

  const openAdd = () => { setForm({ shgId: "", name: "", villageId: "", gpId: "", formationDate: "" }); setSelected(null); setModal("add"); };
  const openEdit = (s: SHG) => { setForm({ shgId: s.shgId, name: s.name, villageId: s.villageId, gpId: s.gpId, formationDate: s.formationDate }); setSelected(s); setModal("edit"); };

  const handleSave = () => {
    if (!form.name.trim()) return alert("कृपया नाम भरें");
    const shg = { id: selected?.id || crypto.randomUUID(), ...form, name: form.name.trim() };
    saveMutation.mutate(shg);
    setModal(null);
  };

  const handleDelete = (id: string) => { 
    if (confirm("हटाएं?")) { 
      deleteMutation.mutate(id); 
    } 
  };

  if (loadingSHGs || loadingVillages || loadingGPs) return <div className="p-8 text-center">लोड हो रहा है...</div>;

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1><span className="page-icon">👥</span>SHG समूह ({shgs.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ नया SHG</button>
      </div>
      <div className="search-bar"><input placeholder="🔍 खोजें..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">👥</span><p>कोई SHG नहीं मिला।</p></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>SHG ID</th><th>नाम</th><th>गाँव</th><th>GP</th><th>स्थापना</th><th>कार्रवाई</th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.shgId}</td>
                  <td>
                    <Link to="/shg-dashboard" search={{ id: s.id }} style={{ fontWeight: 600 }}>
                      {s.name}
                    </Link>
                  </td>
                  <td>{villages.find(v => v.id === s.villageId)?.name || "—"}</td>
                  <td>{gps.find(g => g.id === s.gpId)?.name || "—"}</td>
                  <td>{s.formationDate || "—"}</td>
                  <td className="actions">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate({ to: "/shg-dashboard", search: { id: s.id } })}>📊</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? "⏳" : "🗑️"}
                    </button>
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
            <div className="modal-header"><h3>{modal === "add" ? "नया SHG" : "संपादित करें"}</h3></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>SHG ID</label><input className="form-input" value={form.shgId} onChange={(e) => setForm({ ...form, shgId: e.target.value })} placeholder="SHG039" /></div>
                <div className="form-group"><label>नाम</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
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
                <div className="form-group"><label>स्थापना तिथि</label><input className="form-input" type="date" value={form.formationDate} onChange={(e) => setForm({ ...form, formationDate: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "सुरक्षित हो रहा है..." : "सुरक्षित करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
