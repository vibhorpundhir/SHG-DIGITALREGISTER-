import { useMemo, useState } from "react";
import { useRegisters, api, formatMonthHindi, type SavedRegister } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./master-data.css";

type Props = {
  onBack: () => void;
  onLoad: (reg: SavedRegister) => void;
};

export function RegisterManager({ onBack, onLoad }: Props) {
  const { data: registers = [], isLoading } = useRegisters();
  const [filterSHG, setFilterSHG] = useState("");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: api.deleteRegister,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["registers"] }); },
    onError: (err) => alert("हटाने में त्रुटि: " + err.message)
  });

  const shgNames = useMemo(() => {
    const names = new Set<string>();
    registers.forEach((r) => { if (r.header.shgName) names.add(r.header.shgName); });
    return Array.from(names).sort();
  }, [registers]);

  const filtered = useMemo(() => {
    let list = registers;
    if (filterSHG) list = list.filter((r) => r.header.shgName === filterSHG);
    return list.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
  }, [registers, filterSHG]);

  const handleDelete = (id: string) => {
    if (!confirm("क्या आप यह रजिस्टर हटाना चाहते हैं?")) return;
    deleteMutation.mutate(id);
  };

  const n = (v: number | ""): number => (v === "" ? 0 : Number(v) || 0);

  if (isLoading) return <div className="p-8 text-center">लोड हो रहा है...</div>;

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1>
          <span className="page-icon">📂</span>
          सहेजे गए रजिस्टर ({filtered.length})
        </h1>
        <button className="btn btn-secondary" onClick={onBack}>← रजिस्टर पर वापस</button>
      </div>

      <div className="search-bar">
        <select value={filterSHG} onChange={(e) => setFilterSHG(e.target.value)}>
          <option value="">सभी SHG</option>
          {shgNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>कोई सहेजा गया रजिस्टर नहीं मिला।</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SHG</th>
                <th>माह</th>
                <th>मीटिंग नं.</th>
                <th>तिथि</th>
                <th>सदस्य</th>
                <th>कुल बचत</th>
                <th>सहेजा</th>
                <th>कार्रवाई</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => {
                const totalSaving = reg.members.reduce((s, m) => s + n(m.totalSaving), 0);
                return (
                  <tr key={reg.id}>
                    <td><strong>{reg.header.shgName}</strong></td>
                    <td>{reg.month ? formatMonthHindi(reg.month) : "—"}</td>
                    <td>{reg.header.meetingNo || "—"}</td>
                    <td>{reg.header.meetingDate || "—"}</td>
                    <td>{reg.members.length}</td>
                    <td>₹{totalSaving.toLocaleString("en-IN")}</td>
                    <td style={{ fontSize: 11 }}>{new Date(reg.savedAt).toLocaleDateString("hi-IN")}</td>
                    <td className="actions">
                      <button className="btn btn-primary btn-sm" onClick={() => onLoad(reg)}>📂 खोलें</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(reg.id)} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
