import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────────────

export type GramPanchayat = { id: string; name: string; code: string; };
export type Village = { id: string; name: string; code: string; gpId: string; };
export type SHG = { id: string; shgId: string; name: string; villageId: string; gpId: string; formationDate: string; };
export type Member = { id: string; name: string; fatherHusbandName: string; mobile: string; address: string; villageId: string; gpId: string; shgId: string; joiningDate: string; };

export type SavedRegister = {
  id: string; savedAt: string; month: string;
  header: { shgId: string; shgName: string; village: string; gramPanchayat: string; meetingDate: string; meetingNo: string; monthLabel: string; [k: string]: string; };
  members: {
    id: string; name: string; attendance: string;
    savingDeposit: number | ""; shgPrincipalDeposit: number | ""; shgInterestDeposit: number | "";
    bankPrincipalDeposit: number | ""; bankInterestDeposit: number | ""; penaltyEtc: number | "";
    loanDistSHG: number | ""; loanDistBankPMC: number | ""; totalSaving: number | "";
    shgLoan: number | ""; bankPMCLoan: number | ""; [k: string]: any;
  }[];
  cashIncome: { label: string; amount: number | "" }[];
  cashExpense: { label: string; amount: number | "" }[];
  talpatIncome: { label: string; amount: number | "" }[];
  talpatExpense: { label: string; amount: number | "" }[];
  openingCash: number | "";
};

export type MonthlyRecord = {
  key: string; shgName: string; month: string;
  registers: SavedRegister[]; lastUpdated: string;
  closingSummary?: { closingCash: number; totalSaving: number; shgLoan: number; bankPMCLoan: number; bankInsTillThisMonth: number; };
};

export type CarryForwardData = { openingCash: number; totalSaving: number; shgLoan: number; bankPMCLoan: number; bankInsTillLastMonth: number; };

const n = (v: number | ""): number => (v === "" ? 0 : Number(v) || 0);

// ─── Firebase API ────────────────────────────────────────────────────

const timeout = (ms: number, msg: string) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

const withTimeout = <T>(promise: Promise<T>, operationName: string): Promise<T> => {
  return Promise.race([
    promise,
    timeout(5000, `Firebase Timeout during ${operationName}. Please check your internet connection or Firebase Console settings.`)
  ]);
};

export const api = {
  async getGPs(): Promise<GramPanchayat[]> {
    console.log("[Firestore READ] collection: gram_panchayats");
    const snap = await withTimeout(getDocs(collection(db, "gram_panchayats")), "getGPs");
    return snap.docs.map((d) => d.data() as GramPanchayat);
  },
  async saveGP(gp: GramPanchayat) {
    console.log("[Firestore WRITE] collection: gram_panchayats, id:", gp.id);
    await withTimeout(setDoc(doc(db, "gram_panchayats", gp.id), gp), "saveGP");
  },
  async deleteGP(id: string) {
    console.log("[Firestore DELETE] collection: gram_panchayats, id:", id);
    await withTimeout(deleteDoc(doc(db, "gram_panchayats", id)), "deleteGP");
  },

  async getVillages(): Promise<Village[]> {
    console.log("[Firestore READ] collection: villages");
    const snap = await withTimeout(getDocs(collection(db, "villages")), "getVillages");
    return snap.docs.map((d) => d.data() as Village);
  },
  async saveVillage(v: Village) {
    console.log("[Firestore WRITE] collection: villages, id:", v.id);
    await withTimeout(setDoc(doc(db, "villages", v.id), v), "saveVillage");
  },
  async deleteVillage(id: string) {
    console.log("[Firestore DELETE] collection: villages, id:", id);
    await withTimeout(deleteDoc(doc(db, "villages", id)), "deleteVillage");
  },

  async getSHGs(): Promise<SHG[]> {
    console.log("[Firestore READ] collection: shgs");
    const snap = await withTimeout(getDocs(collection(db, "shgs")), "getSHGs");
    return snap.docs.map((d) => d.data() as SHG);
  },
  async saveSHG(shg: SHG) {
    console.log("[Firestore WRITE] collection: shgs, id:", shg.id);
    await withTimeout(setDoc(doc(db, "shgs", shg.id), shg), "saveSHG");
  },
  async deleteSHG(id: string) {
    console.log("[Firestore DELETE] collection: shgs, id:", id);
    await withTimeout(deleteDoc(doc(db, "shgs", id)), "deleteSHG");
  },

  async getMembers(): Promise<Member[]> {
    console.log("[Firestore READ] collection: members");
    const snap = await withTimeout(getDocs(collection(db, "members")), "getMembers");
    return snap.docs.map((d) => d.data() as Member);
  },
  async saveMember(m: Member) {
    console.log("[Firestore WRITE] collection: members, id:", m.id);
    await withTimeout(setDoc(doc(db, "members", m.id), m), "saveMember");
  },
  async deleteMember(id: string) {
    console.log("[Firestore DELETE] collection: members, id:", id);
    await withTimeout(deleteDoc(doc(db, "members", id)), "deleteMember");
  },

  async getSavedRegisters(): Promise<SavedRegister[]> {
    console.log("[Firestore READ] collection: saved_registers");
    const snap = await withTimeout(getDocs(collection(db, "saved_registers")), "getSavedRegisters");
    return snap.docs.map((d) => d.data() as SavedRegister);
  },
  async saveRegister(reg: SavedRegister) {
    console.log("[Firestore WRITE] collection: saved_registers, id:", reg.id);
    await withTimeout(setDoc(doc(db, "saved_registers", reg.id), reg), "saveRegister");
  },
  async deleteRegister(id: string) {
    console.log("[Firestore DELETE] collection: saved_registers, id:", id);
    await withTimeout(deleteDoc(doc(db, "saved_registers", id)), "deleteRegister");
  },

  async getMonthlyRecords(): Promise<MonthlyRecord[]> {
    console.log("[Firestore READ] collection: monthly_records");
    const snap = await withTimeout(getDocs(collection(db, "monthly_records")), "getMonthlyRecords");
    return snap.docs.map((d) => d.data() as MonthlyRecord);
  },
  async saveMonthlyRecord(rec: MonthlyRecord) {
    console.log("[Firestore WRITE] collection: monthly_records, id:", rec.key);
    await withTimeout(setDoc(doc(db, "monthly_records", rec.key), rec), "saveMonthlyRecord");
  }
};

// ─── React Query Hooks ───────────────────────────────────────────────

export function useGPs() { return useQuery({ queryKey: ["gps"], queryFn: api.getGPs, initialData: [] }); }
export function useVillages() { return useQuery({ queryKey: ["villages"], queryFn: api.getVillages, initialData: [] }); }
export function useSHGs() { return useQuery({ queryKey: ["shgs"], queryFn: api.getSHGs, initialData: [] }); }
export function useMembers() { return useQuery({ queryKey: ["members"], queryFn: api.getMembers, initialData: [] }); }
export function useRegisters() { return useQuery({ queryKey: ["registers"], queryFn: api.getSavedRegisters, initialData: [] }); }
export function useMonthlyRecords() { return useQuery({ queryKey: ["monthlyRecords"], queryFn: api.getMonthlyRecords, initialData: [] }); }

// Filter Hooks
export function useSHGRegisters(shgName: string) {
  const { data: registers = [], ...rest } = useRegisters();
  const shgRegisters = registers
    .filter((r) => r.header.shgName === shgName)
    .sort((a, b) => (a.header.meetingDate || "").localeCompare(b.header.meetingDate || ""));
  return { data: shgRegisters, ...rest };
}

// ─── Computation Helpers (Pure Functions) ────────────────────────────

export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthHindi(month: string): string {
  if (!month) return "—";
  const months: Record<string, string> = { "01": "जनवरी", "02": "फरवरी", "03": "मार्च", "04": "अप्रैल", "05": "मई", "06": "जून", "07": "जुलाई", "08": "अगस्त", "09": "सितंबर", "10": "अक्टूबर", "11": "नवंबर", "12": "दिसंबर" };
  const [y, m] = month.split("-");
  return `${months[m] || m} ${y}`;
}

export function getPreviousMonthData(registers: SavedRegister[], currentMonth: string): CarryForwardData {
  const prevRegisters = registers
    .filter((r) => r.month < currentMonth)
    .sort((a, b) => (b.header.meetingDate || "").localeCompare(a.header.meetingDate || ""));

  if (prevRegisters.length === 0) {
    return { openingCash: 0, totalSaving: 0, shgLoan: 0, bankPMCLoan: 0, bankInsTillLastMonth: 0 };
  }

  const last = prevRegisters[0];
  let totalSaving = 0, shgLoan = 0, bankPMCLoan = 0;
  last.members.forEach((m) => {
    totalSaving += n(m.totalSaving);
    shgLoan += n(m.shgLoan);
    bankPMCLoan += n(m.bankPMCLoan);
  });

  let cashIncome = 0, cashExpense = 0;
  last.cashIncome?.forEach((c) => (cashIncome += n(c.amount)));
  last.cashExpense?.forEach((c) => (cashExpense += n(c.amount)));
  const closingCash = cashIncome - cashExpense;

  let bankInsTillLastMonth = 0;
  const allPrevRegs = registers.filter((r) => r.month <= (last.month || ""));
  allPrevRegs.forEach((r) => {
    r.talpatExpense?.forEach((te) => {
      if (te.label.includes("Bank Ins") && te.label.includes("This Month")) {
        bankInsTillLastMonth += n(te.amount);
      }
    });
  });

  return { openingCash: closingCash, totalSaving, shgLoan, bankPMCLoan, bankInsTillLastMonth };
}

export type MemberTransaction = {
  meetingDate: string; month: string; meetingNo: string; attendance: string;
  savingDeposit: number; shgPrincipalDeposit: number; shgInterestDeposit: number;
  bankPrincipalDeposit: number; bankInterestDeposit: number; penaltyEtc: number;
  loanDistSHG: number; loanDistBankPMC: number; totalSaving: number;
  shgLoan: number; bankPMCLoan: number;
};

export function getMemberHistory(registers: SavedRegister[], memberName: string): MemberTransaction[] {
  const transactions: MemberTransaction[] = [];
  for (const reg of registers) {
    const member = reg.members.find((m) => m.name.trim() === memberName.trim());
    if (!member) continue;
    transactions.push({
      meetingDate: reg.header.meetingDate || reg.savedAt?.slice(0, 10) || "",
      month: reg.month || "", meetingNo: reg.header.meetingNo || "",
      attendance: member.attendance || "",
      savingDeposit: n(member.savingDeposit),
      shgPrincipalDeposit: n(member.shgPrincipalDeposit),
      shgInterestDeposit: n(member.shgInterestDeposit),
      bankPrincipalDeposit: n(member.bankPrincipalDeposit),
      bankInterestDeposit: n(member.bankInterestDeposit),
      penaltyEtc: n(member.penaltyEtc),
      loanDistSHG: n(member.loanDistSHG),
      loanDistBankPMC: n(member.loanDistBankPMC),
      totalSaving: n(member.totalSaving),
      shgLoan: n(member.shgLoan),
      bankPMCLoan: n(member.bankPMCLoan),
    });
  }
  return transactions.sort((a, b) => (a.meetingDate || "").localeCompare(b.meetingDate || ""));
}

export type MemberReport = {
  totalSavingDeposit: number; latestTotalSaving: number; meetingCount: number;
  totalLoanDistSHG: number; totalLoanDistBankPMC: number;
  totalShgPrincipal: number; totalShgInterest: number;
  totalBankPrincipal: number; totalBankInterest: number;
  latestShgLoan: number; latestBankPMCLoan: number;
  totalPenalty: number; presentCount: number; absentCount: number;
};

export function getMemberReport(registers: SavedRegister[], memberName: string): MemberReport | null {
  const txns = getMemberHistory(registers, memberName);
  if (txns.length === 0) return null;

  let totalSavingDeposit = 0, totalLoanDistSHG = 0, totalLoanDistBankPMC = 0;
  let totalShgPrincipal = 0, totalShgInterest = 0, totalBankPrincipal = 0, totalBankInterest = 0;
  let totalPenalty = 0, presentCount = 0, absentCount = 0;

  for (const t of txns) {
    totalSavingDeposit += t.savingDeposit;
    totalLoanDistSHG += t.loanDistSHG;
    totalLoanDistBankPMC += t.loanDistBankPMC;
    totalShgPrincipal += t.shgPrincipalDeposit;
    totalShgInterest += t.shgInterestDeposit;
    totalBankPrincipal += t.bankPrincipalDeposit;
    totalBankInterest += t.bankInterestDeposit;
    totalPenalty += t.penaltyEtc;
    if (t.attendance === "P") presentCount++;
    else if (t.attendance === "A") absentCount++;
  }

  const latest = txns[txns.length - 1];

  return {
    totalSavingDeposit, latestTotalSaving: latest.totalSaving, meetingCount: txns.length,
    totalLoanDistSHG, totalLoanDistBankPMC, totalShgPrincipal, totalShgInterest,
    totalBankPrincipal, totalBankInterest, latestShgLoan: latest.shgLoan,
    latestBankPMCLoan: latest.bankPMCLoan, totalPenalty, presentCount, absentCount,
  };
}

export type AttendanceReport = { totalMeetings: number; present: number; absent: number; attendancePercent: number; regularityScore: string; };

export function getMemberAttendance(registers: SavedRegister[], memberName: string): AttendanceReport | null {
  const txns = getMemberHistory(registers, memberName);
  if (txns.length === 0) return null;

  let present = 0, absent = 0;
  for (const t of txns) {
    if (t.attendance === "P") present++;
    else if (t.attendance === "A") absent++;
  }

  const total = present + absent;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  let score = "कमज़ोर";
  if (pct >= 90) score = "उत्कृष्ट";
  else if (pct >= 75) score = "अच्छा";
  else if (pct >= 50) score = "ठीक";

  return { totalMeetings: total, present, absent, attendancePercent: pct, regularityScore: score };
}

export type SavingsTimelinePoint = { month: string; monthLabel: string; savingDeposit: number; cumulativeSaving: number; totalSaving: number; };

export function getMemberSavingsTimeline(registers: SavedRegister[], memberName: string): SavingsTimelinePoint[] {
  const txns = getMemberHistory(registers, memberName);
  if (txns.length === 0) return [];

  const monthMap = new Map<string, { deposit: number; totalSaving: number }>();
  for (const t of txns) {
    const m = t.month || t.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || { deposit: 0, totalSaving: 0 };
    existing.deposit += t.savingDeposit;
    existing.totalSaving = t.totalSaving || existing.totalSaving;
    monthMap.set(m, existing);
  }

  const sortedMonths = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  return sortedMonths.map(([month, data]) => {
    cumulative += data.deposit;
    return { month, monthLabel: formatMonthHindi(month), savingDeposit: data.deposit, cumulativeSaving: cumulative, totalSaving: data.totalSaving };
  });
}

export type LoanTimelinePoint = { month: string; monthLabel: string; shgLoanDist: number; shgPrincipalRecovery: number; shgInterestRecovery: number; shgLoanBalance: number; bankLoanDist: number; bankPrincipalRecovery: number; bankInterestRecovery: number; bankLoanBalance: number; };

export function getMemberLoanTimeline(registers: SavedRegister[], memberName: string): LoanTimelinePoint[] {
  const txns = getMemberHistory(registers, memberName);
  if (txns.length === 0) return [];

  const monthMap = new Map<string, LoanTimelinePoint>();
  for (const t of txns) {
    const m = t.month || t.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || { month: m, monthLabel: formatMonthHindi(m), shgLoanDist: 0, shgPrincipalRecovery: 0, shgInterestRecovery: 0, shgLoanBalance: 0, bankLoanDist: 0, bankPrincipalRecovery: 0, bankInterestRecovery: 0, bankLoanBalance: 0 };
    existing.shgLoanDist += t.loanDistSHG;
    existing.shgPrincipalRecovery += t.shgPrincipalDeposit;
    existing.shgInterestRecovery += t.shgInterestDeposit;
    existing.shgLoanBalance = t.shgLoan || existing.shgLoanBalance;
    existing.bankLoanDist += t.loanDistBankPMC;
    existing.bankPrincipalRecovery += t.bankPrincipalDeposit;
    existing.bankInterestRecovery += t.bankInterestDeposit;
    existing.bankLoanBalance = t.bankPMCLoan || existing.bankLoanBalance;
    monthMap.set(m, existing);
  }

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export type SHGReport = { totalSavingDeposit: number; totalSaving: number; totalShgLoan: number; totalBankPMCLoan: number; totalShgPrincipalRecovery: number; totalShgInterestRecovery: number; totalBankPrincipalRecovery: number; totalBankInterestRecovery: number; totalLoanDistSHG: number; totalLoanDistBankPMC: number; totalPenalty: number; meetingCount: number; memberCount: number; cashIncome: number; cashExpense: number; };

export function getSHGReport(registers: SavedRegister[]): SHGReport {
  let totalSavingDeposit = 0, totalShgPrincipalRecovery = 0, totalShgInterestRecovery = 0;
  let totalBankPrincipalRecovery = 0, totalBankInterestRecovery = 0;
  let totalLoanDistSHG = 0, totalLoanDistBankPMC = 0, totalPenalty = 0;
  let cashIncome = 0, cashExpense = 0;

  for (const reg of registers) {
    for (const m of reg.members) {
      totalSavingDeposit += n(m.savingDeposit);
      totalShgPrincipalRecovery += n(m.shgPrincipalDeposit);
      totalShgInterestRecovery += n(m.shgInterestDeposit);
      totalBankPrincipalRecovery += n(m.bankPrincipalDeposit);
      totalBankInterestRecovery += n(m.bankInterestDeposit);
      totalLoanDistSHG += n(m.loanDistSHG);
      totalLoanDistBankPMC += n(m.loanDistBankPMC);
      totalPenalty += n(m.penaltyEtc);
    }
    reg.cashIncome?.forEach((c) => (cashIncome += n(c.amount)));
    reg.cashExpense?.forEach((c) => (cashExpense += n(c.amount)));
  }

  let totalSaving = 0, totalShgLoan = 0, totalBankPMCLoan = 0;
  if (registers.length > 0) {
    const latest = registers[registers.length - 1];
    for (const m of latest.members) {
      totalSaving += n(m.totalSaving);
      totalShgLoan += n(m.shgLoan);
      totalBankPMCLoan += n(m.bankPMCLoan);
    }
  }

  return {
    totalSavingDeposit, totalSaving, totalShgLoan, totalBankPMCLoan,
    totalShgPrincipalRecovery, totalShgInterestRecovery,
    totalBankPrincipalRecovery, totalBankInterestRecovery,
    totalLoanDistSHG, totalLoanDistBankPMC, totalPenalty,
    meetingCount: registers.length,
    memberCount: registers.length > 0 ? registers[registers.length - 1].members.length : 0,
    cashIncome, cashExpense,
  };
}

export function getSHGSavingsTimeline(registers: SavedRegister[]) {
  const monthMap = new Map<string, { deposit: number; totalSaving: number }>();
  for (const reg of registers) {
    const m = reg.month || reg.header.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || { deposit: 0, totalSaving: 0 };
    let regTotal = 0;
    for (const member of reg.members) {
      existing.deposit += n(member.savingDeposit);
      regTotal += n(member.totalSaving);
    }
    existing.totalSaving = regTotal || existing.totalSaving;
    monthMap.set(m, existing);
  }

  let cumulative = 0;
  return Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => {
    cumulative += data.deposit;
    return { month, monthLabel: formatMonthHindi(month), savingDeposit: data.deposit, cumulativeSaving: cumulative, totalSaving: data.totalSaving };
  });
}

export function getSHGLoanTimeline(registers: SavedRegister[]) {
  const monthMap = new Map<string, any>();
  for (const reg of registers) {
    const m = reg.month || reg.header.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || { month: m, monthLabel: formatMonthHindi(m), shgLoanDist: 0, shgRecovery: 0, shgBalance: 0, bankLoanDist: 0, bankRecovery: 0, bankBalance: 0 };
    let shgBal = 0, bankBal = 0;
    for (const member of reg.members) {
      existing.shgLoanDist += n(member.loanDistSHG);
      existing.shgRecovery += n(member.shgPrincipalDeposit) + n(member.shgInterestDeposit);
      existing.bankLoanDist += n(member.loanDistBankPMC);
      existing.bankRecovery += n(member.bankPrincipalDeposit) + n(member.bankInterestDeposit);
      shgBal += n(member.shgLoan);
      bankBal += n(member.bankPMCLoan);
    }
    existing.shgBalance = shgBal || existing.shgBalance;
    existing.bankBalance = bankBal || existing.bankBalance;
    monthMap.set(m, existing);
  }
  return Array.from(monthMap.values()).sort((a: any, b: any) => a.month.localeCompare(b.month));
}