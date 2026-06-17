import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSHGs, useVillages, useGPs, useMembers, useRegisters, getSHGReport, getSHGSavingsTimeline, getSHGLoanTimeline, formatMonthHindi } from "@/lib/store";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "../components/shg-dashboard.css";

type SearchParams = { id?: string };

export const Route = createFileRoute("/shg-dashboard")({
  head: () => ({ meta: [{ title: "SHG डैशबोर्ड — SHG प्रबंधन" }] }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({ id: (search.id as string) || undefined }),
  component: SHGDashboardPage,
});

const fmt = (v: number) => (v ? `₹${v.toLocaleString("en-IN")}` : "—");
const n = (v: number | ""): number => (v === "" ? 0 : Number(v) || 0);

function SHGDashboardPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "meetings" | "members" | "talpat">("overview");

  const { data: allShgs = [], isLoading: loadingSHGs } = useSHGs();
  const { data: allVillages = [], isLoading: loadingVillages } = useVillages();
  const { data: allGps = [], isLoading: loadingGPs } = useGPs();
  const { data: allMembers = [], isLoading: loadingMembers } = useMembers();
  const { data: allRegisters = [], isLoading: loadingRegisters } = useRegisters();

  const shg = useMemo(() => (id ? allShgs.find(s => s.id === id) : null), [id, allShgs]);
  const village = useMemo(() => (shg ? allVillages.find(v => v.id === shg.villageId) : null), [shg, allVillages]);
  const gp = useMemo(() => (shg ? allGps.find(g => g.id === shg.gpId) : null), [shg, allGps]);
  const members = useMemo(() => (shg ? allMembers.filter(m => m.shgId === shg.id) : []), [shg, allMembers]);
  const registers = useMemo(() => (shg ? allRegisters.filter(r => r.header.shgName === shg.name) : []), [shg, allRegisters]);

  const report = useMemo(() => (shg ? getSHGReport(registers) : null), [shg, registers]);
  const savingsTimeline = useMemo(() => (shg ? getSHGSavingsTimeline(registers) : []), [shg, registers]);
  const loanTimeline = useMemo(() => (shg ? getSHGLoanTimeline(registers) : []), [shg, registers]);

  if (loadingSHGs || loadingVillages || loadingGPs || loadingMembers || loadingRegisters) {
    return <div className="p-8 text-center">लोड हो रहा है...</div>;
  }

  if (!shg) {
    return (
      <div className="shg-dash">
        <div style={{ textAlign: "center", padding: 48, color: "#5a6580" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p>SHG नहीं मिला।</p>
          <Link to="/shg" className="btn btn-primary" style={{ marginTop: 12, display: "inline-flex" }}>← SHG सूची</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shg-dash">
      <div className="shg-breadcrumb"><Link to="/shg">SHG सूची</Link><span className="sep">›</span><span>{shg.name}</span></div>

      <div className="shg-profile">
        <div className="shg-avatar">{shg.name.charAt(0)}</div>
        <div className="shg-profile-info">
          <h1>{shg.name}</h1>
          <div className="shg-profile-meta">
            <span><strong>ID:</strong> {shg.shgId}</span>
            <span><strong>गाँव:</strong> {village?.name || "—"}</span>
            <span><strong>GP:</strong> {gp?.name || "—"}</span>
            <span><strong>स्थापना:</strong> {shg.formationDate}</span>
          </div>
        </div>
        <div className="shg-profile-actions"><button className="btn-back" onClick={() => navigate({ to: "/shg" })}>← पीछे जाएँ</button></div>
      </div>

      <div className="shg-tabs">
        {[
          { key: "overview", label: "📊 डैशबोर्ड" },
          { key: "meetings", label: `📝 बैठकें (${registers.length})` },
          { key: "members", label: `👤 सदस्य (${members.length})` },
          { key: "talpat", label: "📋 तलपट बैलेंस" },
        ].map((t) => (
          <button key={t.key} className={`shg-tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key as any)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && report && (
        <>
          <div className="overview-grid">
            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-label">कुल बचत जमा</div><div className="stat-value green">{fmt(report.totalSavingDeposit)}</div></div>
            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-label">वर्तमान कुल बचत</div><div className="stat-value blue">{fmt(report.totalSaving)}</div></div>
            <div className="stat-card"><div className="stat-icon">🏦</div><div className="stat-label">SHG ऋण शेष</div><div className="stat-value orange">{fmt(report.totalShgLoan)}</div></div>
            <div className="stat-card"><div className="stat-icon">🏛️</div><div className="stat-label">Bank ऋण शेष</div><div className="stat-value">{fmt(report.totalBankPMCLoan)}</div></div>
            <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-label">कुल मीटिंग</div><div className="stat-value">{report.meetingCount}</div></div>
            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-label">सदस्य</div><div className="stat-value">{report.memberCount}</div></div>
          </div>
          {savingsTimeline.length > 0 && (
            <div className="chart-section">
              <h3>📊 मासिक बचत जमा</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={savingsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="monthLabel" tick={{ fill: "#718096", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#718096", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                  <Legend />
                  <Bar dataKey="savingDeposit" fill="#34d399" name="मासिक बचत" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {activeTab === "meetings" && (
        <div className="meetings-list">
          {registers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#5a6580" }}><p>कोई बैठक रिकॉर्ड नहीं</p></div>
          ) : (
            registers.map((reg, i) => {
              const totalSaving = reg.members.reduce((s, m) => s + n(m.savingDeposit), 0);
              const presentCount = reg.members.filter((m) => m.attendance === "P").length;
              return (
                <div key={reg.id} className="meeting-card">
                  <div className="meeting-no">{reg.header.meetingNo || i + 1}</div>
                  <div className="meeting-info">
                    <div className="meeting-date">{reg.month ? formatMonthHindi(reg.month) : "—"}</div>
                    <div className="meeting-meta">दिनांक: {reg.header.meetingDate || "—"}</div>
                  </div>
                  <div className="meeting-stats">
                    <span>💰 <strong>₹{totalSaving.toLocaleString("en-IN")}</strong></span>
                    <span>👥 <strong>{presentCount}/{reg.members.length}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="data-table-wrap" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>नाम</th><th>पिता/पति</th><th>मोबाइल</th><th>कार्रवाई</th></tr></thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td><Link to="/member-talpat" search={{ id: m.id }} style={{ fontWeight: 600 }}>{m.name}</Link></td>
                  <td>{m.fatherHusbandName || "—"}</td>
                  <td>{m.mobile || "—"}</td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => navigate({ to: "/member-talpat", search: { id: m.id } })}>📊 तलपट</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "talpat" && report && (
        <div className="talpat-sheet">
          <h3>📋 समूह तलपट बैलेंस शीट</h3>
          <div className="talpat-grid">
            <div className="talpat-col">
              <h4 style={{ color: "#34d399" }}>📥 आय (Income / Liabilities)</h4>
              <div className="talpat-row"><span className="label">कुल बचत (Total Saving)</span><span className="value">{fmt(report.totalSaving)}</span></div>
              <div className="talpat-row"><span className="label">SHG ब्याज (Interest Earned)</span><span className="value">{fmt(report.totalShgInterestRecovery)}</span></div>
              <div className="talpat-row"><span className="label">Bank ब्याज</span><span className="value">{fmt(report.totalBankInterestRecovery)}</span></div>
              <div className="talpat-row"><span className="label">पैनल्टी</span><span className="value">{fmt(report.totalPenalty)}</span></div>
              <div className="talpat-row total"><span className="label">कुल आय</span><span className="value">{fmt(report.totalSaving + report.totalShgInterestRecovery + report.totalBankInterestRecovery + report.totalPenalty)}</span></div>
            </div>
            <div className="talpat-col">
              <h4 style={{ color: "#f87171" }}>📤 व्यय (Expense / Assets)</h4>
              <div className="talpat-row"><span className="label">SHG ऋण शेष</span><span className="value">{fmt(report.totalShgLoan)}</span></div>
              <div className="talpat-row"><span className="label">Bank ऋण शेष</span><span className="value">{fmt(report.totalBankPMCLoan)}</span></div>
              <div className="talpat-row"><span className="label">नकद आय</span><span className="value">{fmt(report.cashIncome)}</span></div>
              <div className="talpat-row"><span className="label">नकद व्यय</span><span className="value">{fmt(report.cashExpense)}</span></div>
              <div className="talpat-row total"><span className="label">कुल व्यय / ऋण</span><span className="value">{fmt(report.totalShgLoan + report.totalBankPMCLoan)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
