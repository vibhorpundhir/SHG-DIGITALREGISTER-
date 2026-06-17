import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMembers, useSHGs, useVillages, useGPs, useRegisters, getMemberHistory, getMemberReport, getMemberAttendance, getMemberSavingsTimeline, getMemberLoanTimeline, formatMonthHindi } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import "../components/member-talpat.css";

type SearchParams = { id?: string };

export const Route = createFileRoute("/member-talpat")({
  head: () => ({ meta: [{ title: "सदस्य तलपट — SHG प्रबंधन" }] }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({ id: (search.id as string) || undefined }),
  component: MemberTalpatPage,
});

const fmt = (v: number) => (v ? `₹${v.toLocaleString("en-IN")}` : "—");
const fmtNum = (v: number) => (v ? v.toLocaleString("en-IN") : "—");

function MemberTalpatPage() {
  const { id } = Route.useSearch();
  const [tab, setTab] = useState<"overview" | "transactions" | "savings" | "loans">("overview");
  const [monthFilter, setMonthFilter] = useState("");

  const { data: allMembers = [], isLoading: loadingMembers } = useMembers();
  const { data: allShgs = [], isLoading: loadingSHGs } = useSHGs();
  const { data: allVillages = [], isLoading: loadingVillages } = useVillages();
  const { data: allGps = [], isLoading: loadingGPs } = useGPs();
  const { data: allRegisters = [], isLoading: loadingRegisters } = useRegisters();

  const member = useMemo(() => (id ? allMembers.find(m => m.id === id) : undefined), [id, allMembers]);
  const shg = useMemo(() => (member ? allShgs.find(s => s.id === member.shgId) : undefined), [member, allShgs]);
  const village = useMemo(() => (member ? allVillages.find(v => v.id === member.villageId) : undefined), [member, allVillages]);
  const gp = useMemo(() => (member ? allGps.find(g => g.id === member.gpId) : undefined), [member, allGps]);
  
  const registers = useMemo(() => (shg ? allRegisters.filter(r => r.header.shgName === shg.name) : []), [shg, allRegisters]);

  const transactions = useMemo(() => (member && shg ? getMemberHistory(registers, member.name) : []), [member, shg, registers]);
  const report = useMemo(() => (member && shg ? getMemberReport(registers, member.name) : null), [member, shg, registers]);
  const attendance = useMemo(() => (member && shg ? getMemberAttendance(registers, member.name) : null), [member, shg, registers]);
  const savingsTimeline = useMemo(() => (member && shg ? getMemberSavingsTimeline(registers, member.name) : []), [member, shg, registers]);
  const loanTimeline = useMemo(() => (member && shg ? getMemberLoanTimeline(registers, member.name) : []), [member, shg, registers]);

  const allMonths = useMemo(() => Array.from(new Set(transactions.map((t) => t.month))).sort(), [transactions]);
  const filteredTransactions = useMemo(() => monthFilter ? transactions.filter((t) => t.month === monthFilter) : transactions, [transactions, monthFilter]);

  const attClass = attendance ? (attendance.attendancePercent >= 90 ? "excellent" : attendance.attendancePercent >= 75 ? "good" : attendance.attendancePercent >= 50 ? "average" : "poor") : "";

  const tabs = [
    { key: "overview", label: "सारांश", icon: "📊" },
    { key: "transactions", label: "लेन-देन", icon: "📋" },
    { key: "savings", label: "बचत", icon: "💰" },
    { key: "loans", label: "ऋण", icon: "🏦" },
  ];

  if (loadingMembers || loadingSHGs || loadingVillages || loadingGPs || loadingRegisters) {
    return <div className="p-8 text-center">लोड हो रहा है...</div>;
  }

  if (!member) {
    return (
      <div className="talpat-page">
        <div className="talpat-empty"><span className="empty-icon">👤</span><p>सदस्य नहीं मिला।</p>
          <Link to="/member" className="btn btn-primary" style={{ marginTop: 12 }}>← सदस्य सूची</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="talpat-page">
      <div className="talpat-profile">
        <div className="talpat-avatar">{member.name.charAt(0)}</div>
        <div className="talpat-profile-info">
          <h1>{member.name}</h1>
          <div className="talpat-profile-meta">
            <span>👥 <strong>{shg?.name || "—"}</strong></span>
            <span>🏘️ <strong>{village?.name || "—"}</strong></span>
            <span>🏛️ <strong>{gp?.name || "—"}</strong></span>
            <span>📅 शामिल: <strong>{member.joiningDate || "—"}</strong></span>
            {attendance && <span className={`talpat-attendance-badge ${attClass}`}>✓ {attendance.attendancePercent}% — {attendance.regularityScore}</span>}
          </div>
        </div>
        <div className="talpat-profile-actions"><Link to="/member" className="btn-back">← सदस्य सूची</Link></div>
      </div>

      <div className="talpat-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`talpat-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && report && (
        <>
          <div className="talpat-summary">
            <div className="talpat-card highlight"><div className="talpat-card-icon">💰</div><div className="talpat-card-label">कुल बचत जमा</div><div className="talpat-card-value green">{fmt(report.totalSavingDeposit)}</div></div>
            <div className="talpat-card highlight"><div className="talpat-card-icon">📈</div><div className="talpat-card-label">कुल बचत (अंतिम)</div><div className="talpat-card-value blue">{fmt(report.latestTotalSaving)}</div></div>
            <div className="talpat-card"><div className="talpat-card-icon">🏦</div><div className="talpat-card-label">SHG ऋण शेष</div><div className="talpat-card-value orange">{fmt(report.latestShgLoan)}</div></div>
            <div className="talpat-card"><div className="talpat-card-icon">🏛️</div><div className="talpat-card-label">Bank ऋण शेष</div><div className="talpat-card-value">{fmt(report.latestBankPMCLoan)}</div></div>
            <div className="talpat-card"><div className="talpat-card-icon">📅</div><div className="talpat-card-label">कुल मीटिंग</div><div className="talpat-card-value">{report.meetingCount}</div></div>
          </div>
          {savingsTimeline.length > 0 && (
            <div className="talpat-chart-section">
              <h3>📊 मासिक बचत</h3>
              <div className="talpat-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={savingsTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="monthLabel" tick={{ fill: "#718096", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#718096", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                    <Legend />
                    <Bar dataKey="savingDeposit" fill="#34d399" name="मासिक बचत" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="cumulativeSaving" stroke="#63b3ed" strokeWidth={2} name="संचित बचत" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
      {tab === "overview" && !report && (
        <div className="talpat-empty"><span className="empty-icon">📭</span><p>कोई तलपट रिकॉर्ड नहीं मिला।</p></div>
      )}

      {tab === "transactions" && (
        <>
          <div className="talpat-txn-controls">
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="">सभी माह</option>
              {allMonths.map((m) => <option key={m} value={m}>{formatMonthHindi(m)}</option>)}
            </select>
            <span style={{ color: "#718096", fontSize: 12 }}>{filteredTransactions.length} लेन-देन</span>
          </div>
          {filteredTransactions.length === 0 ? (
            <div className="talpat-empty"><span className="empty-icon">📭</span><p>कोई लेन-देन नहीं</p></div>
          ) : (
            <div className="talpat-txn-table-wrap">
              <table className="talpat-txn-table">
                <thead><tr>
                  <th>#</th><th>दिनांक</th><th>माह</th><th>मीटिंग</th><th>उपस्थिति</th><th>बचत जमा</th>
                  <th>SHG मूलधन</th><th>SHG ब्याज</th><th>Bank मूलधन</th><th>Bank ब्याज</th><th>पैनल्टी</th>
                  <th>SHG ऋण वि.</th><th>Bank ऋण वि.</th><th>कुल बचत</th><th>SHG Loan</th><th>Bank Loan</th>
                </tr></thead>
                <tbody>
                  {filteredTransactions.map((t, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td><td>{t.meetingDate}</td><td>{t.month ? formatMonthHindi(t.month) : "—"}</td>
                      <td>{t.meetingNo}</td><td>{t.attendance || "—"}</td>
                      <td className="deposit">{fmtNum(t.savingDeposit)}</td>
                      <td className="deposit">{fmtNum(t.shgPrincipalDeposit)}</td>
                      <td className="deposit">{fmtNum(t.shgInterestDeposit)}</td>
                      <td className="deposit">{fmtNum(t.bankPrincipalDeposit)}</td>
                      <td className="deposit">{fmtNum(t.bankInterestDeposit)}</td>
                      <td className="penalty">{fmtNum(t.penaltyEtc)}</td>
                      <td className="loan">{fmtNum(t.loanDistSHG)}</td>
                      <td className="loan">{fmtNum(t.loanDistBankPMC)}</td>
                      <td style={{ fontWeight: 600 }}>{fmtNum(t.totalSaving)}</td>
                      <td>{fmtNum(t.shgLoan)}</td>
                      <td>{fmtNum(t.bankPMCLoan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "savings" && report && (
        <>
          <div className="talpat-summary">
            <div className="talpat-card highlight"><div className="talpat-card-icon">💰</div><div className="talpat-card-label">कुल बचत जमा</div><div className="talpat-card-value green">{fmt(report.totalSavingDeposit)}</div></div>
            <div className="talpat-card"><div className="talpat-card-icon">📊</div><div className="talpat-card-label">प्रति मीटिंग औसत</div><div className="talpat-card-value blue">{fmt(Math.round(report.totalSavingDeposit / (report.meetingCount || 1)))}</div></div>
            <div className="talpat-card highlight"><div className="talpat-card-icon">📈</div><div className="talpat-card-label">वर्तमान कुल बचत</div><div className="talpat-card-value green">{fmt(report.latestTotalSaving)}</div></div>
          </div>
          <div className="talpat-chart-section">
            <h3>📋 मासिक बचत विवरण</h3>
            <div className="talpat-txn-table-wrap">
              <table className="talpat-txn-table">
                <thead><tr><th>#</th><th>माह</th><th>बचत जमा</th><th>संचित बचत</th><th>कुल बचत (Talpat)</th></tr></thead>
                <tbody>
                  {savingsTimeline.map((s, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{s.monthLabel}</td><td className="deposit">{fmtNum(s.savingDeposit)}</td><td style={{ fontWeight: 600 }}>{fmtNum(s.cumulativeSaving)}</td><td>{fmtNum(s.totalSaving)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "loans" && report && (
        <>
          <div className="talpat-loan-grid">
            <div className="talpat-loan-card shg">
              <h4>🏦 SHG ऋण</h4>
              <div className="talpat-loan-rows">
                <div className="talpat-loan-row"><span className="label">कुल ऋण वितरण</span><span className="value highlight-orange">{fmt(report.totalLoanDistSHG)}</span></div>
                <div className="talpat-loan-row"><span className="label">कुल मूलधन जमा</span><span className="value highlight-green">{fmt(report.totalShgPrincipal)}</span></div>
                <div className="talpat-loan-row"><span className="label">कुल ब्याज जमा</span><span className="value highlight-green">{fmt(report.totalShgInterest)}</span></div>
                <div className="talpat-loan-row"><span className="label">वर्तमान शेष</span><span className="value highlight-blue">{fmt(report.latestShgLoan)}</span></div>
              </div>
            </div>
            <div className="talpat-loan-card bank">
              <h4>🏛️ Bank/PMC ऋण</h4>
              <div className="talpat-loan-rows">
                <div className="talpat-loan-row"><span className="label">कुल ऋण वितरण</span><span className="value highlight-orange">{fmt(report.totalLoanDistBankPMC)}</span></div>
                <div className="talpat-loan-row"><span className="label">कुल मूलधन जमा</span><span className="value highlight-green">{fmt(report.totalBankPrincipal)}</span></div>
                <div className="talpat-loan-row"><span className="label">कुल ब्याज जमा</span><span className="value highlight-green">{fmt(report.totalBankInterest)}</span></div>
                <div className="talpat-loan-row"><span className="label">वर्तमान शेष</span><span className="value highlight-blue">{fmt(report.latestBankPMCLoan)}</span></div>
              </div>
            </div>
          </div>
          {loanTimeline.length > 0 && (
            <div className="talpat-chart-section">
              <h3>📊 मासिक ऋण विवरण</h3>
              <div className="talpat-txn-table-wrap">
                <table className="talpat-txn-table">
                  <thead><tr><th>माह</th><th>SHG वितरण</th><th>SHG वसूली</th><th>SHG शेष</th><th>Bank वितरण</th><th>Bank वसूली</th><th>Bank शेष</th></tr></thead>
                  <tbody>
                    {loanTimeline.map((l, i) => (
                      <tr key={i}>
                        <td>{l.monthLabel}</td>
                        <td className="loan">{fmtNum(l.shgLoanDist)}</td>
                        <td className="deposit">{fmtNum(l.shgPrincipalRecovery + l.shgInterestRecovery)}</td>
                        <td style={{ fontWeight: 600 }}>{fmtNum(l.shgLoanBalance)}</td>
                        <td className="loan">{fmtNum(l.bankLoanDist)}</td>
                        <td className="deposit">{fmtNum(l.bankPrincipalRecovery + l.bankInterestRecovery)}</td>
                        <td style={{ fontWeight: 600 }}>{fmtNum(l.bankLoanBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
