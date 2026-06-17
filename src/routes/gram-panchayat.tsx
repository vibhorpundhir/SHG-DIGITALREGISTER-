import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useGPs, api, type GramPanchayat } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "../components/master-data.css";

export const Route = createFileRoute("/gram-panchayat")({
  head: () => ({
    meta: [
      { title: "ग्राम पंचायत — SHG प्रबंधन" },
      { name: "description", content: "Gram Panchayat master data management" },
    ],
  }),
  component: GPPage,
});

function GPPage() {
  const { data: gps = [], isLoading } = useGPs();
  const queryClient = useQueryClient();
  
  const saveMutation = useMutation({
    mutationFn: api.saveGP,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gps"] }); },
    onError: (err) => alert("सेव करने में त्रुटि: " + err.message)
  });
  
  const deleteMutation = useMutation({
    mutationFn: api.deleteGP,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gps"] }); },
    onError: (err) => alert("हटाने में त्रुटि: " + err.message)
  });

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [selected, setSelected] = useState<GramPanchayat | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });

  const filtered = useMemo(() => {
    if (!search) return gps;
    const s = search.toLowerCase();
    return gps.filter((g) => g.name.toLowerCase().includes(s) || g.code.toLowerCase().includes(s));
  }, [gps, search]);

  const openAdd = () => {
    setForm({ name: "", code: "" });
    setSelected(null);
    setModal("add");
  };

  const openEdit = (gp: GramPanchayat) => {
    setForm({ name: gp.name, code: gp.code });
    setSelected(gp);
    setModal("edit");
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert("कृपया नाम भरें");
    const gp: GramPanchayat = {
      id: selected?.id || crypto.randomUUID(),
      name: form.name.trim(),
      code: form.code.trim(),
    };
    saveMutation.mutate(gp);
    setModal(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("क्या आप इसे हटाना चाहते हैं?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center">लोड हो रहा है...</div>;

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1><span className="page-icon">🏛️</span>ग्राम पंचायत ({gps.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ नई ग्राम पंचायत</button>
      </div>

      <div className="search-bar">
        <input placeholder="🔍 खोजें..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏛️</span>
          <p>कोई ग्राम पंचायत नहीं मिली। नई जोड़ें।</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>नाम</th><th>कोड</th><th>कार्रवाई</th></tr>
            </thead>
            <tbody>
              {filtered.map((gp) => (
                <tr key={gp.id}>
                  <td><strong>{gp.name}</strong></td>
                  <td>{gp.code || "—"}</td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(gp)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(gp.id)} disabled={deleteMutation.isPending}>
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
            <div className="modal-header"><h3>{modal === "add" ? "नई ग्राम पंचायत" : "संपादित करें"}</h3></div>
            <div className="modal-body">
              <div className="form-group">
                <label>नाम</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ग्राम पंचायत का नाम" />
              </div>
              <div className="form-group">
                <label>कोड</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="GP001" />
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
