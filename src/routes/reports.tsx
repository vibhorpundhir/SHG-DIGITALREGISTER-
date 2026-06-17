import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSHGs, useMembers, useVillages, useRegisters, getSHGReport, getMemberReport } from "@/lib/store";
import "../components/master-data.css";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "रिपोर्ट्स — SHG प्रबंधन" }] }),
  component: ReportsPage,
});

const fmt = (v: number) => (v ? `₹${v.toLocaleString("en-IN")}` : "—");

function ReportsPage() {
  const [tab, setTab] = useState<"shg" | "members">("shg");
  const { data: shgs = [], isLoading: loadingSHGs } = useSHGs();
  const { data: members = [], isLoading: loadingMembers } = useMembers();
  const { data: villages = [], isLoading: loadingVillages } = useVillages();
  const { data: registers = [], isLoading: loadingRegisters } = useRegisters();
  
  const [filterSHG, setFilterSHG] = useState("");

  const shgMap = useMemo(() => new Map(shgs.map((s) => [s.id, s])), [shgs]);
  const villageMap = useMemo(() => new Map(villages.map((v) => [v.id, v])), [villages]);

  const shgReports = useMemo(() => {
    return shgs.map((s) => {
      const shgRegisters = registers.filter((r) => r.header.shgName === s.name);
      const report = getSHGReport(shgRegisters);
      const village = villageMap.get(s.villageId);
      return { ...s, villageName: village?.name || "—", ...report };
    });
  }, [shgs, villageMap, registers]);

  const memberReports = useMemo(() => {
    if (tab !== "members") return [];
    let list = members;
    if (filterSHG) list = list.filter((m) => m.shgId === filterSHG);
    return list.map((m) => {
      const shg = shgMap.get(m.shgId);
      const report = getMemberReport(registers, m.name);
      return { ...m, shgName: shg?.name || "—", report };
    });
  }, [members, filterSHG, tab, shgMap, registers]);

  if (loadingSHGs || loadingMembers || loadingVillages || loadingRegisters) {
    return <div className="p-8 text-center">लोड हो रहा है...</div>;
  }

  return (
    <div className="master-page">
      <div className="master-page-header">
        <h1><span className="page-icon">📊</span>रिपोर्ट्स</h1>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border-color)" }}>
        <button
          style={{ padding: "10px 16px", background: "transparent", border: "none", borderBottom: tab === "shg" ? "2px solid var(--accent-blue)" : "2px solid transparent", color: tab === "shg" ? "var(--accent-blue)" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          onClick={() => setTab("shg")}
        >👥 SHG रिपोर्ट</button>
        <button
          style={{ padding: "10px 16px", background: "transparent", border: "none", borderBottom: tab === "members" ? "2px solid var(--accent-blue)" : "2px solid transparent", color: tab === "members" ? "var(--accent-blue)" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          onClick={() => setTab("members")}
        >👤 सदस्य रिपोर्ट</button>
      </div>

      {tab === "shg" && (
        <div className="data-table-wrap" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SHG</th><th>गाँव</th><th>सदस्य</th><th>मीटिंग</th><th>कुल बचत जमा</th>
                <th>वर्तमान बचत</th><th>SHG ऋण</th><th>Bank ऋण</th><th>कार्रवाई</th>
              </tr>
            </thead>
            <tbody>
              {shgReports.map((s) => (
                <tr key={s.id}>
                  <td><Link to="/shg-dashboard" search={{ id: s.id }} style={{ fontWeight: 600 }}>{s.name}</Link></td>
                  <td>{s.villageName}</td>
                  <td>{s.memberCount}</td>
                  <td>{s.meetingCount}</td>
                  <td style={{ color: "var(--accent-green)" }}>{fmt(s.totalSavingDeposit)}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(s.totalSaving)}</td>
                  <td style={{ color: "var(--accent-orange)" }}>{fmt(s.totalShgLoan)}</td>
                  <td>{fmt(s.totalBankPMCLoan)}</td>
                  <td><Link to="/shg-dashboard" search={{ id: s.id }} className="btn btn-primary btn-sm">📊 डैशबोर्ड</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "members" && (
        <>
          <div className="search-bar">
            <select value={filterSHG} onChange={(e) => setFilterSHG(e.target.value)}>
              <option value="">सभी SHG</option>
              {shgs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="data-table-wrap" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>नाम</th><th>SHG</th><th>मीटिंग</th><th>बचत जमा</th><th>कुल बचत</th>
                  <th>SHG ऋण वि.</th><th>SHG ऋण शेष</th><th>Bank ऋण शेष</th><th>कार्रवाई</th>
                </tr>
              </thead>
              <tbody>
                {memberReports.map((m) => (
                  <tr key={m.id}>
                    <td><Link to="/member-talpat" search={{ id: m.id }} style={{ fontWeight: 600 }}>{m.name}</Link></td>
                    <td>{m.shgName}</td>
                    <td>{m.report?.meetingCount || 0}</td>
                    <td style={{ color: "var(--accent-green)" }}>{fmt(m.report?.totalSavingDeposit || 0)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(m.report?.latestTotalSaving || 0)}</td>
                    <td style={{ color: "var(--accent-orange)" }}>{fmt(m.report?.totalLoanDistSHG || 0)}</td>
                    <td>{fmt(m.report?.latestShgLoan || 0)}</td>
                    <td>{fmt(m.report?.latestBankPMCLoan || 0)}</td>
                    <td><Link to="/member-talpat" search={{ id: m.id }} className="btn btn-primary btn-sm">📊 तलपट</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
