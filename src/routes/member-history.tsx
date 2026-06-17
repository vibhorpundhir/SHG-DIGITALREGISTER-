import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMembers, useSHGs, useVillages, useGPs, useRegisters, getMemberHistory, getMemberReport, formatMonthHindi } from "@/lib/store";
import "../components/master-data.css";

type SearchParams = { id?: string };

export const Route = createFileRoute("/member-history")({
  head: () => ({ meta: [{ title: "सदस्य इतिहास — SHG प्रबंधन" }] }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({ id: (search.id as string) || undefined }),
  component: MemberHistoryPage,
});

const fmt = (v: number) => (v ? v.toLocaleString("en-IN") : "—");

function MemberHistoryPage() {
  const { id } = Route.useSearch();
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

  if (loadingMembers || loadingSHGs || loadingVillages || loadingGPs || loadingRegisters) {
    return <div className="p-8 text-center">लोड हो रहा है...</div>;
  }

  if (!member) {
    return (
      <div className="master-page">
        <div className="breadcrumb"><Link to="/member">सदस्य</Link><span className="sep">›</span><span>इतिहास</span></div>
        <div className="empty-state"><span className="empty-icon">👤</span><p>सदस्य नहीं मिला।</p>
          <Link to="/member" className="btn btn-primary" style={{ marginTop: 12, display: "inline-flex" }}>← सदस्य सूची</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="master-page">
      <div className="breadcrumb"><Link to="/member">सदस्य</Link><span className="sep">›</span><span>{member.name}</span></div>
      <div className="master-page-header">
        <h1><span className="page-icon">👤</span>{member.name}</h1>
        <Link to="/member" className="btn btn-secondary">← सदस्य सूची</Link>
      </div>

      <div className="detail-section">
        <h3>📋 व्यक्तिगत विवरण</h3>
        <div className="info-cards">
          <div className="info-card"><div className="info-label">नाम</div><div className="info-value">{member.name}</div></div>
          <div className="info-card"><div className="info-label">पिता/पति</div><div className="info-value">{member.fatherHusbandName || "—"}</div></div>
          <div className="info-card"><div className="info-label">मोबाइल</div><div className="info-value">{member.mobile || "—"}</div></div>
          <div className="info-card"><div className="info-label">SHG</div><div className="info-value">{shg?.name || "—"}</div></div>
          <div className="info-card"><div className="info-label">गाँव</div><div className="info-value">{village?.name || "—"}</div></div>
          <div className="info-card"><div className="info-label">GP</div><div className="info-value">{gp?.name || "—"}</div></div>
        </div>
      </div>

      {report && (
        <>
          <div className="detail-section">
            <h3>💰 बचत सारांश</h3>
            <div className="info-cards">
              <div className="info-card highlight"><div className="info-label">कुल बचत जमा</div><div className="info-value">₹ {fmt(report.totalSavingDeposit)}</div></div>
              <div className="info-card highlight"><div className="info-label">कुल बचत (अंतिम)</div><div className="info-value">₹ {fmt(report.latestTotalSaving)}</div></div>
              <div className="info-card"><div className="info-label">कुल मीटिंग</div><div className="info-value">{report.meetingCount}</div></div>
            </div>
          </div>
          <div className="detail-section">
            <h3>🏦 ऋण सारांश</h3>
            <div className="info-cards">
              <div className="info-card"><div className="info-label">SHG ऋण वितरण</div><div className="info-value">₹ {fmt(report.totalLoanDistSHG)}</div></div>
              <div className="info-card"><div className="info-label">Bank ऋण वितरण</div><div className="info-value">₹ {fmt(report.totalLoanDistBankPMC)}</div></div>
              <div className="info-card"><div className="info-label">SHG मूलधन जमा</div><div className="info-value">₹ {fmt(report.totalShgPrincipal)}</div></div>
              <div className="info-card"><div className="info-label">SHG ब्याज जमा</div><div className="info-value">₹ {fmt(report.totalShgInterest)}</div></div>
              <div className="info-card highlight"><div className="info-label">SHG ऋण शेष</div><div className="info-value">₹ {fmt(report.latestShgLoan)}</div></div>
              <div className="info-card highlight"><div className="info-label">Bank ऋण शेष</div><div className="info-value">₹ {fmt(report.latestBankPMCLoan)}</div></div>
            </div>
          </div>
        </>
      )}

      <div className="detail-section">
        <h3>📊 तलपट लेन-देन इतिहास</h3>
        {transactions.length === 0 ? (
          <p style={{ color: "#5a6580", fontSize: 13 }}>कोई तलपट रिकॉर्ड नहीं मिला।</p>
        ) : (
          <div className="data-table-wrap" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>दिनांक</th><th>माह</th><th>मीटिंग</th><th>उपस्थिति</th><th>बचत जमा</th>
                  <th>SHG मूलधन</th><th>SHG ब्याज</th><th>Bank मूलधन</th><th>Bank ब्याज</th><th>पैनल्टी</th>
                  <th>SHG ऋण वि.</th><th>Bank ऋण वि.</th><th>कुल बचत</th><th>SHG Loan</th><th>Bank Loan</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{t.meetingDate}</td>
                    <td>{t.month ? formatMonthHindi(t.month) : "—"}</td>
                    <td>{t.meetingNo}</td>
                    <td>{t.attendance || "—"}</td>
                    <td>{fmt(t.savingDeposit)}</td>
                    <td>{fmt(t.shgPrincipalDeposit)}</td>
                    <td>{fmt(t.shgInterestDeposit)}</td>
                    <td>{fmt(t.bankPrincipalDeposit)}</td>
                    <td>{fmt(t.bankInterestDeposit)}</td>
                    <td>{fmt(t.penaltyEtc)}</td>
                    <td>{fmt(t.loanDistSHG)}</td>
                    <td>{fmt(t.loanDistBankPMC)}</td>
                    <td>{fmt(t.totalSaving)}</td>
                    <td>{fmt(t.shgLoan)}</td>
                    <td>{fmt(t.bankPMCLoan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
