/**
 * Demo data seeder for SHG Management System.
 * Generates 30 realistic SHG groups, members, and 12 months of accurate meeting registers.
 */
import {
  saveGP,
  saveVillage,
  saveSHG,
  saveMember,
  saveRegister,
  clearAllData,
  type SavedRegister,
} from "./store";

function uid(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function seedDemoData(): void {
  clearAllData();

  // ─── Gram Panchayats ──────────────────────────────────────────────
  const gps = [
    { id: uid(), name: "विजापुर ग्राम पंचायत", code: "GP001" },
    { id: uid(), name: "रामपुर ग्राम पंचायत", code: "GP002" },
    { id: uid(), name: "सीतापुर ग्राम पंचायत", code: "GP003" },
    { id: uid(), name: "लक्ष्मणगढ़ ग्राम पंचायत", code: "GP004" },
    { id: uid(), name: "भरतपुर ग्राम पंचायत", code: "GP005" },
  ];
  gps.forEach(saveGP);

  // ─── Villages ─────────────────────────────────────────────────────
  const villages = [
    { id: uid(), name: "विजापुर", code: "V001", gpId: gps[0].id },
    { id: uid(), name: "सुंदरनगर", code: "V002", gpId: gps[0].id },
    { id: uid(), name: "रामपुर", code: "V003", gpId: gps[1].id },
    { id: uid(), name: "किशनपुरा", code: "V004", gpId: gps[1].id },
    { id: uid(), name: "सीतापुर", code: "V005", gpId: gps[2].id },
    { id: uid(), name: "हरिपुर", code: "V006", gpId: gps[2].id },
    { id: uid(), name: "लक्ष्मणगढ़", code: "V007", gpId: gps[3].id },
    { id: uid(), name: "नया गाँव", code: "V008", gpId: gps[3].id },
    { id: uid(), name: "भरतपुर", code: "V009", gpId: gps[4].id },
    { id: uid(), name: "शांतिनगर", code: "V010", gpId: gps[4].id },
  ];
  villages.forEach(saveVillage);

  // ─── SHG Names ────────────────────────────────────────────────────
  const shgNames = [
    "Deepak SHG", "Lakshmi SHG", "Durga SHG", "Saraswati SHG", "Ganga SHG",
    "Yamuna SHG", "Narmada SHG", "Kaveri SHG", "Godavari SHG", "Krishna SHG",
    "Shiv Shakti SHG", "Jai Bhavani SHG", "Navratna SHG", "Mahila Vikas SHG", "Nari Shakti SHG",
    "Prakash SHG", "Ujala SHG", "Prerana SHG", "Jagriti SHG", "Roshni SHG",
    "Kamal SHG", "Gulab SHG", "Champa SHG", "Chameli SHG", "Mogra SHG",
    "Tulsi SHG", "Asha SHG", "Umeed SHG", "Kiran SHG", "Jyoti SHG"
  ];

  const firstNames = [
    "Savita", "Seema", "Babita", "Rekha", "Rati Devi", "Mamta", "Pinky", "Maya", "Beena", "Kamla", 
    "Neelam", "Genda", "Manju", "Sunita", "Geeta", "Radha", "Sita", "Poonam", "Asha", "Kavita", 
    "Renu", "Lata", "Meena", "Anita", "Priya", "Shanti", "Usha", "Kiran", "Saroj", "Nirmala", 
    "Pushpa", "Kusum", "Hemlata", "Sarla", "Rajni", "Sushma", "Vimla", "Kanta"
  ];

  const fatherNames = [
    "रामचन्द्र", "सुरेश", "महेश", "गणेश", "दिनेश", "राजेश", "मोहन", "सोहन",
    "विजय", "अमर", "प्रकाश", "रवि", "कमल", "सुभाष", "रमेश", "राकेश", "संजय"
  ];

  // ─── Generate 30 SHGs ─────────────────────────────────────────────
  shgNames.forEach((shgName, si) => {
    const village = villages[si % villages.length];
    const gp = gps.find(g => g.id === village.gpId)!;

    const shg = {
      id: uid(),
      shgId: `SHG00${si + 1}`,
      name: shgName,
      villageId: village.id,
      gpId: gp.id,
      formationDate: "2025-01-01",
    };
    saveSHG(shg);

    // Generate 10 to 15 members per SHG
    const memberCount = randomInt(10, 15);
    const members: { id: string; name: string; saving: number; shgLoan: number; bankLoan: number }[] = [];

    for (let mi = 0; mi < memberCount; mi++) {
      const memberId = uid();
      const name = firstNames[randomInt(0, firstNames.length - 1)];
      saveMember({
        id: memberId,
        name: `${name} ${mi + 1}`, // Add number to ensure unique names within SHG
        fatherHusbandName: fatherNames[randomInt(0, fatherNames.length - 1)],
        mobile: `98${randomInt(10000000, 99999999)}`,
        address: village.name,
        villageId: village.id,
        gpId: gp.id,
        shgId: shg.id,
        joiningDate: "2025-01-01",
      });
      members.push({ id: memberId, name: `${name} ${mi + 1}`, saving: 0, shgLoan: 0, bankLoan: 0 });
    }

    let currentOpeningCash = 0;

    // ─── Generate 12 Months of Meeting Registers ────────────────────
    for (let mi = 0; mi < 12; mi++) {
      const year = 2025;
      const monthNum = mi + 1;
      const monthStr = `${year}-${String(monthNum).padStart(2, "0")}`;
      const meetingDate = `${year}-${String(monthNum).padStart(2, "0")}-05`;
      const savingPerMember = 100;

      // Loan disbursement logic
      const loanMonth = mi === 2 || mi === 6;       // SHG loans given in March & July
      const bankLoanMonth = mi === 4 || mi === 8;   // Bank loans given in May & Sept

      const regMembers = members.map((m, idx) => {
        const isPresent = Math.random() > 0.10; // 90% attendance
        const attendance = isPresent ? "P" : "A";
        const deposit = isPresent ? savingPerMember : 0;

        // Remember previous states for calculation accuracy
        const prevTotalSaving = m.saving;
        const prevShgLoan = m.shgLoan;
        const prevBankPMCLoan = m.bankLoan;

        m.saving += deposit;

        // Loan distribution
        let loanDistSHG = 0;
        let loanDistBankPMC = 0;
        if (loanMonth && idx < 3) {
          loanDistSHG = randomInt(1, 3) * 1000;
          m.shgLoan += loanDistSHG;
        }
        if (bankLoanMonth && idx >= 3 && idx < 5) {
          loanDistBankPMC = randomInt(5, 10) * 1000;
          m.bankLoan += loanDistBankPMC;
        }

        // Loan recovery (shgLoan and bankLoan)
        let shgPrincipal = 0;
        let shgInterest = 0;
        let bankPrincipal = 0;
        let bankInterest = 0;
        if (m.shgLoan > 0 && !loanMonth) {
          shgPrincipal = Math.min(randomInt(200, 500), m.shgLoan);
          shgInterest = Math.round(m.shgLoan * 0.02);
          m.shgLoan = Math.max(0, m.shgLoan - shgPrincipal);
        }
        if (m.bankLoan > 0 && !bankLoanMonth) {
          bankPrincipal = Math.min(randomInt(500, 1000), m.bankLoan);
          bankInterest = Math.round(m.bankLoan * 0.01);
          m.bankLoan = Math.max(0, m.bankLoan - bankPrincipal);
        }

        const penalty = !isPresent ? 10 : 0;

        return {
          id: m.id,
          name: m.name,
          attendance,
          savingDeposit: deposit || ("" as number | ""),
          shgPrincipalDeposit: shgPrincipal || ("" as number | ""),
          shgInterestDeposit: shgInterest || ("" as number | ""),
          bankPrincipalDeposit: bankPrincipal || ("" as number | ""),
          bankInterestDeposit: bankInterest || ("" as number | ""),
          penaltyEtc: penalty || ("" as number | ""),
          loanDistSHG: loanDistSHG || ("" as number | ""),
          loanDistBankPMC: loanDistBankPMC || ("" as number | ""),
          totalSaving: m.saving || ("" as number | ""),
          shgLoan: m.shgLoan || ("" as number | ""),
          bankPMCLoan: m.bankLoan || ("" as number | ""),
          prevTotalSaving,
          prevShgLoan,
          prevBankPMCLoan,
        };
      });

      // Compute meeting totals for cash summaries
      const monthTotalSaving = regMembers.reduce((s, m) => s + (typeof m.savingDeposit === "number" ? m.savingDeposit : 0), 0);
      const monthShgPrincipal = regMembers.reduce((s, m) => s + (typeof m.shgPrincipalDeposit === "number" ? m.shgPrincipalDeposit : 0), 0);
      const monthShgInterest = regMembers.reduce((s, m) => s + (typeof m.shgInterestDeposit === "number" ? m.shgInterestDeposit : 0), 0);
      const monthBankPrincipal = regMembers.reduce((s, m) => s + (typeof m.bankPrincipalDeposit === "number" ? m.bankPrincipalDeposit : 0), 0);
      const monthBankInterest = regMembers.reduce((s, m) => s + (typeof m.bankInterestDeposit === "number" ? m.bankInterestDeposit : 0), 0);
      const monthTotalPenalty = regMembers.reduce((s, m) => s + (typeof m.penaltyEtc === "number" ? m.penaltyEtc : 0), 0);
      
      const monthDistSHG = regMembers.reduce((s, m) => s + (typeof m.loanDistSHG === "number" ? m.loanDistSHG : 0), 0);
      const monthDistBank = regMembers.reduce((s, m) => s + (typeof m.loanDistBankPMC === "number" ? m.loanDistBankPMC : 0), 0);

      const totalIncome = currentOpeningCash + monthTotalSaving + monthShgPrincipal + monthShgInterest + monthBankPrincipal + monthBankInterest + monthTotalPenalty;
      const totalExpense = monthDistBank + monthDistSHG;
      const closingCash = totalIncome - totalExpense;

      const cashIncome: { label: string; amount: number | "" }[] = [
        { label: "पिछला नकद शेष", amount: currentOpeningCash || "" },
        { label: "Saving =", amount: monthTotalSaving || "" },
        { label: "Loan Recovery SHG =", amount: monthShgPrincipal || "" },
        { label: "Interest SHG =", amount: monthShgInterest || "" },
        { label: "Loan Recovery Bank/PMC =", amount: monthBankPrincipal || "" },
        { label: "Interest Bank/PMC =", amount: monthBankInterest || "" },
        { label: "Penalty etc. =", amount: monthTotalPenalty || "" },
        { label: "Rec. Loan Bank/PMC =", amount: "" },
      ];

      const cashExpense: { label: string; amount: number | "" }[] = [
        { label: "Bank/PMC Loan Distribution =", amount: monthDistBank || "" },
        { label: "SHG Loan Distribution =", amount: monthDistSHG || "" },
        { label: "समूह खर्चे मूंगफली, स्टेशनरी =", amount: "" },
        { label: "फेडरेशन सदस्यता शुल्क =", amount: "" },
        { label: "लोन पर खर्चे =", amount: "" },
        { label: "लोन किस्त =", amount: "" },
        { label: "बैंक बचत खाते में जमा किया =", amount: "" },
        { label: "आज का नकद शेष =", amount: closingCash || "" },
      ];

      const talpatIncome: { label: string; amount: number | "" }[] = [
        { label: "Interest SHG =", amount: monthShgInterest || "" },
        { label: "Interest Bank/PMC =", amount: monthBankInterest || "" },
        { label: "SHG Penalty etc. =", amount: monthTotalPenalty || "" },
        { label: "Bank Penalty etc. =", amount: "" },
        { label: "Loan Bank/PMC =", amount: "" },
      ];

      const talpatExpense: { label: string; amount: number | "" }[] = [
        { label: "Bank/PMC Loan =", amount: "" },
        { label: "Bank Saving A/c =", amount: "" },
        { label: "SHG Expense =", amount: "" },
        { label: "Exp. In Bank/PMC Loan =", amount: "" },
        { label: "Other Exp. =", amount: "" },
        { label: "Bank Ins. Till Last Month =", amount: "" },
        { label: "Bank Ins. Till This Month =", amount: "" },
        { label: "आज का नकद शेष =", amount: closingCash || "" },
      ];

      const reg: SavedRegister = {
        id: uid(),
        savedAt: new Date(year, monthNum - 1, 5).toISOString(),
        month: monthStr,
        header: {
          shgId: shg.shgId,
          shgName: shg.name,
          village: village.name,
          gramPanchayat: gp.name,
          meetingDate,
          meetingNo: String(mi + 1),
          monthLabel: `Month ${["January","February","March","April","May","June","July","August","September","October","November","December"][monthNum - 1]}-${year}`,
        },
        members: regMembers,
        cashIncome,
        cashExpense,
        talpatIncome,
        talpatExpense,
        openingCash: currentOpeningCash || "",
      };

      saveRegister(reg);
      currentOpeningCash = closingCash;
    }
  });
}
