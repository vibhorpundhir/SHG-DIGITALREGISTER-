/**
 * SHG Management System — Data Store
 *
 * localStorage-backed CRUD for master data, plus read helpers that
 * derive member history and reports from saved Talpat registers.
 */

// ─── Types ───────────────────────────────────────────────────────────

export type GramPanchayat = {
  id: string;
  name: string;
  code: string;
};

export type Village = {
  id: string;
  name: string;
  code: string;
  gpId: string;
};

export type SHG = {
  id: string;
  shgId: string;
  name: string;
  villageId: string;
  gpId: string;
  formationDate: string;
};

export type Member = {
  id: string;
  name: string;
  fatherHusbandName: string;
  mobile: string;
  address: string;
  villageId: string;
  gpId: string;
  shgId: string;
  joiningDate: string;
};

export type SavedRegister = {
  id: string;
  savedAt: string;
  month: string;
  header: {
    shgId: string;
    shgName: string;
    village: string;
    gramPanchayat: string;
    meetingDate: string;
    meetingNo: string;
    monthLabel: string;
    [k: string]: string;
  };
  members: {
    id: string;
    name: string;
    attendance: string;
    savingDeposit: number | "";
    shgPrincipalDeposit: number | "";
    shgInterestDeposit: number | "";
    bankPrincipalDeposit: number | "";
    bankInterestDeposit: number | "";
    penaltyEtc: number | "";
    loanDistSHG: number | "";
    loanDistBankPMC: number | "";
    totalSaving: number | "";
    shgLoan: number | "";
    bankPMCLoan: number | "";
    [k: string]: any;
  }[];
  cashIncome: { label: string; amount: number | "" }[];
  cashExpense: { label: string; amount: number | "" }[];
  talpatIncome: { label: string; amount: number | "" }[];
  talpatExpense: { label: string; amount: number | "" }[];
  openingCash: number | "";
};

export type MonthlyRecord = {
  key: string;
  shgName: string;
  month: string;
  registers: SavedRegister[];
  lastUpdated: string;
  closingSummary?: {
    closingCash: number;
    totalSaving: number;
    shgLoan: number;
    bankPMCLoan: number;
    bankInsTillThisMonth: number;
  };
};

export type CarryForwardData = {
  openingCash: number;
  totalSaving: number;
  shgLoan: number;
  bankPMCLoan: number;
  bankInsTillLastMonth: number;
};

// ─── Storage keys ────────────────────────────────────────────────────

const GP_KEY = "shg-mgmt-gp-v1";
const VILLAGE_KEY = "shg-mgmt-village-v1";
const SHG_KEY = "shg-mgmt-shg-v1";
const MEMBER_KEY = "shg-mgmt-member-v1";
const REGISTERS_KEY = "shg-registers-store-v1";
const MONTHLY_KEY = "shg-monthly-records-v1";

// ─── In-memory cache (avoids repeated JSON.parse on every call) ──────

const _cache = new Map<string, any>();

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  if (_cache.has(key)) return _cache.get(key)!;
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    _cache.set(key, data);
    return data;
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  _cache.set(key, data);
  localStorage.setItem(key, JSON.stringify(data));
}

const n = (v: number | ""): number => (v === "" ? 0 : Number(v) || 0);

// ─── Gram Panchayat ──────────────────────────────────────────────────

export const loadGPs = (): GramPanchayat[] => load<GramPanchayat>(GP_KEY);

export function saveGP(gp: GramPanchayat): void {
  const list = loadGPs();
  const idx = list.findIndex((g) => g.id === gp.id);
  if (idx >= 0) list[idx] = gp;
  else list.push(gp);
  save(GP_KEY, list);
}

export function deleteGP(id: string): void {
  save(GP_KEY, loadGPs().filter((g) => g.id !== id));
}

export function findGP(id: string): GramPanchayat | undefined {
  return loadGPs().find((g) => g.id === id);
}

// ─── Village ─────────────────────────────────────────────────────────

export const loadVillages = (): Village[] => load<Village>(VILLAGE_KEY);

export function saveVillage(v: Village): void {
  const list = loadVillages();
  const idx = list.findIndex((x) => x.id === v.id);
  if (idx >= 0) list[idx] = v;
  else list.push(v);
  save(VILLAGE_KEY, list);
}

export function deleteVillage(id: string): void {
  save(VILLAGE_KEY, loadVillages().filter((v) => v.id !== id));
}

export function findVillage(id: string): Village | undefined {
  return loadVillages().find((v) => v.id === id);
}

export function getVillagesByGP(gpId: string): Village[] {
  return loadVillages().filter((v) => v.gpId === gpId);
}

// ─── SHG ─────────────────────────────────────────────────────────────

export const loadSHGs = (): SHG[] => load<SHG>(SHG_KEY);

export function saveSHG(shg: SHG): void {
  const list = loadSHGs();
  const idx = list.findIndex((s) => s.id === shg.id);
  if (idx >= 0) list[idx] = shg;
  else list.push(shg);
  save(SHG_KEY, list);
}

export function deleteSHG(id: string): void {
  save(SHG_KEY, loadSHGs().filter((s) => s.id !== id));
}

export function findSHG(id: string): SHG | undefined {
  return loadSHGs().find((s) => s.id === id);
}

export function findSHGByName(name: string): SHG | undefined {
  return loadSHGs().find((s) => s.name === name);
}

export function getSHGsByVillage(villageId: string): SHG[] {
  return loadSHGs().filter((s) => s.villageId === villageId);
}

// ─── Member ──────────────────────────────────────────────────────────

export const loadMembers = (): Member[] => load<Member>(MEMBER_KEY);

export function saveMember(m: Member): void {
  const list = loadMembers();
  const idx = list.findIndex((x) => x.id === m.id);
  if (idx >= 0) list[idx] = m;
  else list.push(m);
  save(MEMBER_KEY, list);
}

export function deleteMember(id: string): void {
  save(MEMBER_KEY, loadMembers().filter((m) => m.id !== id));
}

export function findMember(id: string): Member | undefined {
  return loadMembers().find((m) => m.id === id);
}

export function getMembersBySHG(shgId: string): Member[] {
  return loadMembers().filter((m) => m.shgId === shgId);
}

// ─── Registers ───────────────────────────────────────────────────────

export const loadSavedRegisters = (): SavedRegister[] => load<SavedRegister>(REGISTERS_KEY);

export function saveRegister(reg: SavedRegister): void {
  const list = loadSavedRegisters();
  list.push(reg);
  save(REGISTERS_KEY, list);
}

export function deleteRegister(id: string): void {
  save(REGISTERS_KEY, loadSavedRegisters().filter((r) => r.id !== id));
}

export function getRegistersBySHG(shgName: string): SavedRegister[] {
  return loadSavedRegisters()
    .filter((r) => r.header.shgName === shgName)
    .sort((a, b) => (a.header.meetingDate || "").localeCompare(b.header.meetingDate || ""));
}

// ─── Monthly Records ─────────────────────────────────────────────────

export const loadMonthlyRecords = (): MonthlyRecord[] => load<MonthlyRecord>(MONTHLY_KEY);

export function saveMonthlyRecord(rec: MonthlyRecord): void {
  const list = loadMonthlyRecords();
  const idx = list.findIndex((r) => r.key === rec.key);
  if (idx >= 0) list[idx] = rec;
  else list.push(rec);
  save(MONTHLY_KEY, list);
}

export function getMonthlyRecord(shgName: string, month: string): MonthlyRecord | undefined {
  const key = `${shgName}-${month}`;
  return loadMonthlyRecords().find((r) => r.key === key);
}

export function getSHGMonths(shgName: string): string[] {
  const registers = getRegistersBySHG(shgName);
  const months = new Set<string>();
  registers.forEach((r) => {
    if (r.month) months.add(r.month);
  });
  return Array.from(months).sort();
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthHindi(month: string): string {
  if (!month) return "—";
  const months: Record<string, string> = {
    "01": "जनवरी",
    "02": "फरवरी",
    "03": "मार्च",
    "04": "अप्रैल",
    "05": "मई",
    "06": "जून",
    "07": "जुलाई",
    "08": "अगस्त",
    "09": "सितंबर",
    "10": "अक्टूबर",
    "11": "नवंबर",
    "12": "दिसंबर",
  };
  const [y, m] = month.split("-");
  return `${months[m] || m} ${y}`;
}

export function formatMonthEnglish(month: string): string {
  if (!month) return "—";
  const months: Record<string, string> = {
    "01": "January", "02": "February", "03": "March",
    "04": "April", "05": "May", "06": "June",
    "07": "July", "08": "August", "09": "September",
    "10": "October", "11": "November", "12": "December",
  };
  const [y, m] = month.split("-");
  return `${months[m] || m} ${y}`;
}

/**
 * Get carry-forward data from the previous month for a given SHG.
 */
export function getPreviousMonthData(shgName: string, currentMonth: string): CarryForwardData {
  const registers = getRegistersBySHG(shgName);
  const prevRegisters = registers
    .filter((r) => r.month < currentMonth)
    .sort((a, b) => (b.header.meetingDate || "").localeCompare(a.header.meetingDate || ""));

  if (prevRegisters.length === 0) {
    return { openingCash: 0, totalSaving: 0, shgLoan: 0, bankPMCLoan: 0, bankInsTillLastMonth: 0 };
  }

  const last = prevRegisters[0];
  let totalSaving = 0;
  let shgLoan = 0;
  let bankPMCLoan = 0;
  last.members.forEach((m) => {
    totalSaving += n(m.totalSaving);
    shgLoan += n(m.shgLoan);
    bankPMCLoan += n(m.bankPMCLoan);
  });

  // Compute closing cash from the last register
  let cashIncome = 0;
  let cashExpense = 0;
  last.cashIncome?.forEach((c) => (cashIncome += n(c.amount)));
  last.cashExpense?.forEach((c) => (cashExpense += n(c.amount)));
  const closingCash = cashIncome - cashExpense;

  // Bank insurance till last month
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

// ─── Member History (from Talpat data) ───────────────────────────────

export type MemberTransaction = {
  meetingDate: string;
  month: string;
  meetingNo: string;
  attendance: string;
  savingDeposit: number;
  shgPrincipalDeposit: number;
  shgInterestDeposit: number;
  bankPrincipalDeposit: number;
  bankInterestDeposit: number;
  penaltyEtc: number;
  loanDistSHG: number;
  loanDistBankPMC: number;
  totalSaving: number;
  shgLoan: number;
  bankPMCLoan: number;
};

export function getMemberHistory(memberName: string, shgName?: string): MemberTransaction[] {
  const registers = shgName ? getRegistersBySHG(shgName) : loadSavedRegisters();
  const transactions: MemberTransaction[] = [];

  for (const reg of registers) {
    const member = reg.members.find((m) => m.name.trim() === memberName.trim());
    if (!member) continue;

    transactions.push({
      meetingDate: reg.header.meetingDate || reg.savedAt?.slice(0, 10) || "",
      month: reg.month || "",
      meetingNo: reg.header.meetingNo || "",
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

// ─── Member Report ───────────────────────────────────────────────────

export type MemberReport = {
  totalSavingDeposit: number;
  latestTotalSaving: number;
  meetingCount: number;
  totalLoanDistSHG: number;
  totalLoanDistBankPMC: number;
  totalShgPrincipal: number;
  totalShgInterest: number;
  totalBankPrincipal: number;
  totalBankInterest: number;
  latestShgLoan: number;
  latestBankPMCLoan: number;
  totalPenalty: number;
  presentCount: number;
  absentCount: number;
};

export function getMemberReport(memberName: string, shgName?: string): MemberReport | null {
  const txns = getMemberHistory(memberName, shgName);
  if (txns.length === 0) return null;

  let totalSavingDeposit = 0;
  let totalLoanDistSHG = 0;
  let totalLoanDistBankPMC = 0;
  let totalShgPrincipal = 0;
  let totalShgInterest = 0;
  let totalBankPrincipal = 0;
  let totalBankInterest = 0;
  let totalPenalty = 0;
  let presentCount = 0;
  let absentCount = 0;

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
    totalSavingDeposit,
    latestTotalSaving: latest.totalSaving,
    meetingCount: txns.length,
    totalLoanDistSHG,
    totalLoanDistBankPMC,
    totalShgPrincipal,
    totalShgInterest,
    totalBankPrincipal,
    totalBankInterest,
    latestShgLoan: latest.shgLoan,
    latestBankPMCLoan: latest.bankPMCLoan,
    totalPenalty,
    presentCount,
    absentCount,
  };
}

// ─── Member Attendance ───────────────────────────────────────────────

export type AttendanceReport = {
  totalMeetings: number;
  present: number;
  absent: number;
  attendancePercent: number;
  regularityScore: string;
};

export function getMemberAttendance(memberName: string, shgName?: string): AttendanceReport | null {
  const txns = getMemberHistory(memberName, shgName);
  if (txns.length === 0) return null;

  let present = 0;
  let absent = 0;
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

// ─── Savings Timeline ────────────────────────────────────────────────

export type SavingsTimelinePoint = {
  month: string;
  monthLabel: string;
  savingDeposit: number;
  cumulativeSaving: number;
  totalSaving: number;
};

export function getMemberSavingsTimeline(memberName: string, shgName?: string): SavingsTimelinePoint[] {
  const txns = getMemberHistory(memberName, shgName);
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
    return {
      month,
      monthLabel: formatMonthHindi(month),
      savingDeposit: data.deposit,
      cumulativeSaving: cumulative,
      totalSaving: data.totalSaving,
    };
  });
}

// ─── Loan Timeline ───────────────────────────────────────────────────

export type LoanTimelinePoint = {
  month: string;
  monthLabel: string;
  shgLoanDist: number;
  shgPrincipalRecovery: number;
  shgInterestRecovery: number;
  shgLoanBalance: number;
  bankLoanDist: number;
  bankPrincipalRecovery: number;
  bankInterestRecovery: number;
  bankLoanBalance: number;
};

export function getMemberLoanTimeline(memberName: string, shgName?: string): LoanTimelinePoint[] {
  const txns = getMemberHistory(memberName, shgName);
  if (txns.length === 0) return [];

  const monthMap = new Map<string, LoanTimelinePoint>();
  for (const t of txns) {
    const m = t.month || t.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || {
      month: m,
      monthLabel: formatMonthHindi(m),
      shgLoanDist: 0, shgPrincipalRecovery: 0, shgInterestRecovery: 0, shgLoanBalance: 0,
      bankLoanDist: 0, bankPrincipalRecovery: 0, bankInterestRecovery: 0, bankLoanBalance: 0,
    };
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

// ─── SHG-level Report ────────────────────────────────────────────────

export type SHGReport = {
  totalSavingDeposit: number;
  totalSaving: number;
  totalShgLoan: number;
  totalBankPMCLoan: number;
  totalShgPrincipalRecovery: number;
  totalShgInterestRecovery: number;
  totalBankPrincipalRecovery: number;
  totalBankInterestRecovery: number;
  totalLoanDistSHG: number;
  totalLoanDistBankPMC: number;
  totalPenalty: number;
  meetingCount: number;
  memberCount: number;
  cashIncome: number;
  cashExpense: number;
};

export function getSHGReport(shgName: string): SHGReport {
  const registers = getRegistersBySHG(shgName);

  let totalSavingDeposit = 0;
  let totalShgPrincipalRecovery = 0;
  let totalShgInterestRecovery = 0;
  let totalBankPrincipalRecovery = 0;
  let totalBankInterestRecovery = 0;
  let totalLoanDistSHG = 0;
  let totalLoanDistBankPMC = 0;
  let totalPenalty = 0;
  let cashIncome = 0;
  let cashExpense = 0;

  // Sum flows from all registers
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

  // Balances: take from the LATEST register only (stock, not flow)
  let totalSaving = 0;
  let totalShgLoan = 0;
  let totalBankPMCLoan = 0;
  if (registers.length > 0) {
    const latest = registers[registers.length - 1];
    for (const m of latest.members) {
      totalSaving += n(m.totalSaving);
      totalShgLoan += n(m.shgLoan);
      totalBankPMCLoan += n(m.bankPMCLoan);
    }
  }

  return {
    totalSavingDeposit,
    totalSaving,
    totalShgLoan,
    totalBankPMCLoan,
    totalShgPrincipalRecovery,
    totalShgInterestRecovery,
    totalBankPrincipalRecovery,
    totalBankInterestRecovery,
    totalLoanDistSHG,
    totalLoanDistBankPMC,
    totalPenalty,
    meetingCount: registers.length,
    memberCount: registers.length > 0 ? registers[registers.length - 1].members.length : 0,
    cashIncome,
    cashExpense,
  };
}

// ─── SHG Savings Timeline ────────────────────────────────────────────

export function getSHGSavingsTimeline(shgName: string) {
  const registers = getRegistersBySHG(shgName);
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

  const sortedMonths = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  return sortedMonths.map(([month, data]) => {
    cumulative += data.deposit;
    return {
      month,
      monthLabel: formatMonthHindi(month),
      savingDeposit: data.deposit,
      cumulativeSaving: cumulative,
      totalSaving: data.totalSaving,
    };
  });
}

// ─── SHG Loan Timeline ──────────────────────────────────────────────

export function getSHGLoanTimeline(shgName: string) {
  const registers = getRegistersBySHG(shgName);
  const monthMap = new Map<string, any>();

  for (const reg of registers) {
    const m = reg.month || reg.header.meetingDate?.slice(0, 7) || "unknown";
    const existing = monthMap.get(m) || {
      month: m, monthLabel: formatMonthHindi(m),
      shgLoanDist: 0, shgRecovery: 0, shgBalance: 0,
      bankLoanDist: 0, bankRecovery: 0, bankBalance: 0,
    };
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

// ─── Clear all data ──────────────────────────────────────────────────

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  [GP_KEY, VILLAGE_KEY, SHG_KEY, MEMBER_KEY, REGISTERS_KEY, MONTHLY_KEY, "shg-register-v1"].forEach((k) =>
    localStorage.removeItem(k)
  );
  _cache.clear();
}