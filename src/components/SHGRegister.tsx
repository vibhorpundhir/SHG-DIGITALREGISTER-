import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  loadSHGs,
  getMembersBySHG,
  findVillage,
  findGP,
  getCurrentMonth,
  getPreviousMonthData,
  formatMonthEnglish,
  getSHGMonths,
  loadSavedRegisters,
  saveRegister,
  getMemberReport,
  type SavedRegister,
  type CarryForwardData,
} from "@/lib/store";
import { getRouteApi } from "@tanstack/react-router";
import "./register.css";
import { RegisterManager } from "./RegisterManager";

const routeApi = getRouteApi("/");

// ─── Types ─────────────────────────────────────────────────────────

type MemberRow = {
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
  prevTotalSaving?: number;
  prevShgLoan?: number;
  prevBankPMCLoan?: number;
};

type CashRow = { label: string; amount: number | "" };

type State = {
  header: {
    shgId: string;
    shgName: string;
    village: string;
    gramPanchayat: string;
    block: string;
    district: string;
    meetingDate: string;
    meetingNo: string;
    month: string;
    monthLabel: string;
  };
  members: MemberRow[];
  cashIncome: CashRow[];
  cashExpense: CashRow[];
  talpatIncome: CashRow[];
  talpatExpense: CashRow[];
  openingCash: number | "";
};

type Action =
  | { type: "init"; state: State }
  | { type: "header"; field: string; value: string }
  | { type: "member"; index: number; field: string; value: string }
  | { type: "addMember" }
  | { type: "delMember"; index: number }
  | { type: "cashIncome"; index: number; value: string }
  | { type: "cashExpense"; index: number; value: string }
  | { type: "talpatIncome"; index: number; value: string }
  | { type: "talpatExpense"; index: number; value: string }
  | { type: "reset" };

const n = (v: number | ""): number => (v === "" ? 0 : Number(v) || 0);

function emptyMember(): MemberRow {
  return {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    name: "",
    attendance: "",
    savingDeposit: "",
    shgPrincipalDeposit: "",
    shgInterestDeposit: "",
    bankPrincipalDeposit: "",
    bankInterestDeposit: "",
    penaltyEtc: "",
    loanDistSHG: "",
    loanDistBankPMC: "",
    totalSaving: "",
    shgLoan: "",
    bankPMCLoan: "",
    prevTotalSaving: 0,
    prevShgLoan: 0,
    prevBankPMCLoan: 0,
  };
}

const defaultCashIncome: CashRow[] = [
  { label: "पिछला नकद शेष", amount: "" },
  { label: "Saving =", amount: "" },
  { label: "Loan Recovery SHG =", amount: "" },
  { label: "Interest SHG =", amount: "" },
  { label: "Loan Recovery Bank/PMC =", amount: "" },
  { label: "Interest Bank/PMC =", amount: "" },
  { label: "Penalty etc. =", amount: "" },
  { label: "Rec. Loan Bank/PMC =", amount: "" },
];

const defaultCashExpense: CashRow[] = [
  { label: "Bank/PMC Loan Distribution =", amount: "" },
  { label: "SHG Loan Distribution =", amount: "" },
  { label: "समूह खर्चे मूंगफली, स्टेशनरी =", amount: "" },
  { label: "फेडरेशन सदस्यता शुल्क =", amount: "" },
  { label: "लोन पर खर्चे =", amount: "" },
  { label: "लोन किस्त =", amount: "" },
  { label: "बैंक बचत खाते में जमा किया =", amount: "" },
  { label: "आज का नकद शेष =", amount: "" },
];

const defaultTalpatIncome: CashRow[] = [
  { label: "Interest SHG =", amount: "" },
  { label: "Interest Bank/PMC =", amount: "" },
  { label: "SHG Penalty etc. =", amount: "" },
  { label: "Bank Penalty etc. =", amount: "" },
  { label: "Loan Bank/PMC =", amount: "" },
];

const defaultTalpatExpense: CashRow[] = [
  { label: "Bank/PMC Loan =", amount: "" },
  { label: "Bank Saving A/c =", amount: "" },
  { label: "SHG Expense =", amount: "" },
  { label: "Exp. In Bank/PMC Loan =", amount: "" },
  { label: "Other Exp. =", amount: "" },
  { label: "Bank Ins. Till Last Month =", amount: "" },
  { label: "Bank Ins. Till This Month =", amount: "" },
  { label: "आज का नकद शेष =", amount: "" },
];

function initialState(): State {
  return {
    header: { shgId: "", shgName: "", village: "", gramPanchayat: "", block: "", district: "", meetingDate: "", meetingNo: "", month: getCurrentMonth(), monthLabel: "" },
    members: Array.from({ length: 15 }, emptyMember),
    cashIncome: defaultCashIncome.map((c) => ({ ...c })),
    cashExpense: defaultCashExpense.map((c) => ({ ...c })),
    talpatIncome: defaultTalpatIncome.map((c) => ({ ...c })),
    talpatExpense: defaultTalpatExpense.map((c) => ({ ...c })),
    openingCash: "",
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return action.state;
    case "header":
      return { ...state, header: { ...state.header, [action.field]: action.value } };
    case "member": {
      const members = [...state.members];
      const m = { ...members[action.index] };
      if (["savingDeposit", "shgPrincipalDeposit", "shgInterestDeposit", "bankPrincipalDeposit", "bankInterestDeposit", "penaltyEtc", "loanDistSHG", "loanDistBankPMC", "totalSaving", "shgLoan", "bankPMCLoan"].includes(action.field)) {
        (m as any)[action.field] = action.value === "" ? "" : Number(action.value) || 0;
      } else {
        (m as any)[action.field] = action.value;
      }
      
      // Auto-calculate Talpat fields if a source field changed
      if (["savingDeposit", "shgPrincipalDeposit", "loanDistSHG", "bankPrincipalDeposit", "loanDistBankPMC"].includes(action.field)) {
        if (m.prevTotalSaving !== undefined) {
          m.totalSaving = m.prevTotalSaving + n(m.savingDeposit);
        }
        if (m.prevShgLoan !== undefined) {
          m.shgLoan = Math.max(0, m.prevShgLoan + n(m.loanDistSHG) - n(m.shgPrincipalDeposit));
        }
        if (m.prevBankPMCLoan !== undefined) {
          m.bankPMCLoan = Math.max(0, m.prevBankPMCLoan + n(m.loanDistBankPMC) - n(m.bankPrincipalDeposit));
        }
      }

      // Reverse engineer prev fields if a Talpat field was manually edited by the user
      if (action.field === "totalSaving") {
         m.prevTotalSaving = n(m.totalSaving) - n(m.savingDeposit);
      }
      if (action.field === "shgLoan") {
         m.prevShgLoan = n(m.shgLoan) - n(m.loanDistSHG) + n(m.shgPrincipalDeposit);
      }
      if (action.field === "bankPMCLoan") {
         m.prevBankPMCLoan = n(m.bankPMCLoan) - n(m.loanDistBankPMC) + n(m.bankPrincipalDeposit);
      }

      members[action.index] = m;
      return { ...state, members };
    }
    case "addMember":
      return { ...state, members: [...state.members, emptyMember()] };
    case "delMember":
      return { ...state, members: state.members.filter((_, i) => i !== action.index) };
    case "cashIncome": {
      const ci = [...state.cashIncome];
      ci[action.index] = { ...ci[action.index], amount: action.value === "" ? "" : Number(action.value) || 0 };
      return { ...state, cashIncome: ci };
    }
    case "cashExpense": {
      const ce = [...state.cashExpense];
      ce[action.index] = { ...ce[action.index], amount: action.value === "" ? "" : Number(action.value) || 0 };
      return { ...state, cashExpense: ce };
    }
    case "talpatIncome": {
      const ti = [...state.talpatIncome];
      ti[action.index] = { ...ti[action.index], amount: action.value === "" ? "" : Number(action.value) || 0 };
      return { ...state, talpatIncome: ti };
    }
    case "talpatExpense": {
      const te = [...state.talpatExpense];
      te[action.index] = { ...te[action.index], amount: action.value === "" ? "" : Number(action.value) || 0 };
      return { ...state, talpatExpense: te };
    }
    case "reset":
      return initialState();
    default:
      return state;
  }
}

// ─── Component ──────────────────────────────────────────────────────

export function SHGRegister() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [view, setView] = useState<"register" | "manager">("register");
  const printRef = useRef<HTMLDivElement>(null);

  // SHG selection
  const shgs = useMemo(() => loadSHGs(), []);
  const savedMonths = useMemo(() => (state.header.shgName ? getSHGMonths(state.header.shgName) : []), [state.header.shgName]);

  // When SHG changes, load members and carry-forward data
  const handleSHGChange = (shgId: string) => {
    const shg = shgs.find((s) => s.id === shgId);
    if (!shg) return;
    const village = findVillage(shg.villageId);
    const gp = findGP(shg.gpId);
    const members = getMembersBySHG(shg.id);
    const month = getCurrentMonth();
    const prev = getPreviousMonthData(shg.name, month);

    const memberRows: MemberRow[] = members.map((m) => {
      const report = getMemberReport(m.name, shg.name);
      return {
        ...emptyMember(),
        id: m.id,
        name: m.name,
        prevTotalSaving: report?.latestTotalSaving || 0,
        prevShgLoan: report?.latestShgLoan || 0,
        prevBankPMCLoan: report?.latestBankPMCLoan || 0,
      };
    });

    // Pad to at least 15 rows
    while (memberRows.length < 15) memberRows.push(emptyMember());

    const newState = initialState();
    newState.header = {
      ...newState.header,
      shgId: shg.shgId,
      shgName: shg.name,
      village: village?.name || "",
      gramPanchayat: gp?.name || "",
      month,
      monthLabel: `Month ${formatMonthEnglish(month)}`,
    };
    newState.members = memberRows;
    newState.openingCash = prev.openingCash || "";

    dispatch({ type: "init", state: newState });
  };

  // Load a saved register
  const handleLoadRegister = (reg: SavedRegister) => {
    dispatch({
      type: "init",
      state: {
        header: { ...reg.header, block: "", district: "" } as any,
        members: reg.members.map((m) => {
          const loaded = { ...emptyMember(), ...m };
          // Recover legacy missing prev fields by reverse engineering them
          if (m.prevTotalSaving === undefined && m.totalSaving !== undefined && m.totalSaving !== "") {
            loaded.prevTotalSaving = Number(m.totalSaving) - n(m.savingDeposit);
          }
          if (m.prevShgLoan === undefined && m.shgLoan !== undefined && m.shgLoan !== "") {
            loaded.prevShgLoan = Number(m.shgLoan) - n(m.loanDistSHG) + n(m.shgPrincipalDeposit);
          }
          if (m.prevBankPMCLoan === undefined && m.bankPMCLoan !== undefined && m.bankPMCLoan !== "") {
            loaded.prevBankPMCLoan = Number(m.bankPMCLoan) - n(m.loanDistBankPMC) + n(m.bankPrincipalDeposit);
          }
          return loaded;
        }),
        cashIncome: reg.cashIncome?.length ? reg.cashIncome : defaultCashIncome.map((c) => ({ ...c })),
        cashExpense: reg.cashExpense?.length ? reg.cashExpense : defaultCashExpense.map((c) => ({ ...c })),
        talpatIncome: reg.talpatIncome?.length ? reg.talpatIncome : defaultTalpatIncome.map((c) => ({ ...c })),
        talpatExpense: reg.talpatExpense?.length ? reg.talpatExpense : defaultTalpatExpense.map((c) => ({ ...c })),
        openingCash: reg.openingCash ?? "",
      },
    });
    setView("register");
  };

  // ─── Auto-calculations ──────────────────────────────────────────

  const totals = useMemo(() => {
    const t = {
      savingDeposit: 0, shgPrincipalDeposit: 0, shgInterestDeposit: 0,
      bankPrincipalDeposit: 0, bankInterestDeposit: 0, penaltyEtc: 0,
      loanDistSHG: 0, loanDistBankPMC: 0, totalSaving: 0, shgLoan: 0, bankPMCLoan: 0,
    };
    for (const m of state.members) {
      t.savingDeposit += n(m.savingDeposit);
      t.shgPrincipalDeposit += n(m.shgPrincipalDeposit);
      t.shgInterestDeposit += n(m.shgInterestDeposit);
      t.bankPrincipalDeposit += n(m.bankPrincipalDeposit);
      t.bankInterestDeposit += n(m.bankInterestDeposit);
      t.penaltyEtc += n(m.penaltyEtc);
      t.loanDistSHG += n(m.loanDistSHG);
      t.loanDistBankPMC += n(m.loanDistBankPMC);
      t.totalSaving += n(m.totalSaving);
      t.shgLoan += n(m.shgLoan);
      t.bankPMCLoan += n(m.bankPMCLoan);
    }
    return t;
  }, [state.members]);

  const computedCashIncome = useMemo(() => {
    const ci = state.cashIncome.map((c) => ({ ...c }));
    // index 0 = Opening Cash, 1 = Saving, 2 = Loan Recovery SHG, 4 = Loan Recovery Bank/PMC, 6 = Penalty
    if (ci[0]) ci[0].amount = state.openingCash !== "" ? state.openingCash : "";
    if (ci[1]) ci[1].amount = totals.savingDeposit || "";
    if (ci[2]) ci[2].amount = totals.shgPrincipalDeposit || "";
    if (ci[3]) ci[3].amount = totals.shgInterestDeposit || "";
    if (ci[4]) ci[4].amount = totals.bankPrincipalDeposit || "";
    if (ci[5]) ci[5].amount = totals.bankInterestDeposit || "";
    if (ci[6]) ci[6].amount = totals.penaltyEtc || "";
    return ci;
  }, [state.cashIncome, totals, state.openingCash]);

  const computedCashExpense = useMemo(() => {
    const ce = state.cashExpense.map((c) => ({ ...c }));
    if (ce[1]) ce[1].amount = totals.loanDistSHG || "";
    if (ce[0]) ce[0].amount = totals.loanDistBankPMC || "";
    return ce;
  }, [state.cashExpense, totals]);

  const computedTalpatIncome = useMemo(() => {
    const ti = state.talpatIncome.map((c) => ({ ...c }));
    if (ti[0]) ti[0].amount = totals.shgInterestDeposit || "";
    if (ti[1]) ti[1].amount = totals.bankInterestDeposit || "";
    if (ti[2]) ti[2].amount = totals.penaltyEtc || "";
    return ti;
  }, [state.talpatIncome, totals]);

  const computedTalpatExpense = useMemo(() => state.talpatExpense.map((c) => ({ ...c })), [state.talpatExpense]);

  const cashIncomeTotal = useMemo(() => computedCashIncome.reduce((s, c) => s + n(c.amount), 0), [computedCashIncome]);
  // Base expense ignores index 7 (closing cash)
  const baseCashExpenseTotal = useMemo(() => computedCashExpense.reduce((s, c, i) => s + (i === 7 ? 0 : n(c.amount)), 0), [computedCashExpense]);
  const closingCash = cashIncomeTotal - baseCashExpenseTotal;

  const finalCashExpense = useMemo(() => {
    const ce = computedCashExpense.map((c) => ({ ...c }));
    if (ce[7]) ce[7].amount = closingCash || "";
    return ce;
  }, [computedCashExpense, closingCash]);

  const finalTalpatExpense = useMemo(() => {
    const te = computedTalpatExpense.map((c) => ({ ...c }));
    if (te[7]) te[7].amount = closingCash || "";
    return te;
  }, [computedTalpatExpense, closingCash]);

  const isComputedCashIncome = (i: number) => [0, 1, 2, 3, 4, 5, 6].includes(i);
  const isComputedCashExpense = (i: number) => [0, 1, 7].includes(i);
  const isComputedTalpatIncome = (i: number) => [0, 1, 2].includes(i);
  const isComputedTalpatExpense = (i: number) => [7].includes(i);

  const talpatIncomeTotal = useMemo(() => computedTalpatIncome.reduce((s, c) => s + n(c.amount), 0), [computedTalpatIncome]);
  const talpatExpenseTotal = useMemo(() => finalTalpatExpense.reduce((s, c) => s + n(c.amount), 0), [finalTalpatExpense]);

  const fmt = (v: number) => (v ? v.toLocaleString("en-IN") : "0");

  // ─── Save ───────────────────────────────────────────────────────

  const handleSave = () => {
    if (!state.header.shgName) {
      alert("कृपया पहले SHG चुनें!");
      return;
    }
    const reg: SavedRegister = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      savedAt: new Date().toISOString(),
      month: state.header.month || getCurrentMonth(),
      header: { ...state.header },
      members: state.members.filter((m) => m.name.trim()),
      cashIncome: computedCashIncome,
      cashExpense: computedCashExpense,
      talpatIncome: computedTalpatIncome,
      talpatExpense: computedTalpatExpense,
      openingCash: state.openingCash,
    };
    saveRegister(reg);
    alert("✅ रजिस्टर सफलतापूर्वक सुरक्षित हो गया!");
  };

  // ─── Keyboard Navigation ──────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colName: string) => {
    const cols = ["name", "attendance", "savingDeposit", "shgPrincipalDeposit", "shgInterestDeposit", "bankPrincipalDeposit", "bankInterestDeposit", "penaltyEtc", "loanDistSHG", "loanDistBankPMC", "totalSaving", "shgLoan", "bankPMCLoan"];
    const colIndex = cols.indexOf(colName);

    const focusEl = (selector: string) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) { el.focus(); if ('select' in el) (el as HTMLInputElement).select(); }
    };

    if (e.key === "ArrowUp") { e.preventDefault(); focusEl(`[data-row="${rowIndex - 1}"][data-col="${colName}"]`); }
    else if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); focusEl(`[data-row="${rowIndex + 1}"][data-col="${colName}"]`); }
    else if (e.key === "ArrowLeft" && colIndex > 0) { e.preventDefault(); focusEl(`[data-row="${rowIndex}"][data-col="${cols[colIndex - 1]}"]`); }
    else if (e.key === "ArrowRight") {
      const input = e.target as HTMLInputElement;
      if (input.tagName === "SELECT" || input.selectionStart === input.value?.length) {
        e.preventDefault();
        if (colIndex < cols.length - 1) focusEl(`[data-row="${rowIndex}"][data-col="${cols[colIndex + 1]}"]`);
      }
    }
  };

  const handleExportExcel = async () => {
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Register");

    // Helper for colors
    const SOLID = "solid";
    const fill = (argb: string) => ({ type: "pattern" as const, pattern: SOLID as any, fgColor: { argb } });
    const borderAll = {
      top: { style: "thin" as const }, left: { style: "thin" as const },
      bottom: { style: "thin" as const }, right: { style: "thin" as const }
    };
    const center = { vertical: "middle" as const, horizontal: "center" as const };
    
    // Colors
    const cYellow = "FFFFFF00";
    const cBlue = "FF00B0F0";
    const cPeach = "FFFCD5B4";
    const cGreen = "FF92D050";
    const cLightPeach = "FFFCE4D6";
    const cCyan = "FFD9E1F2";

    // Set columns width
    ws.columns = [
      { width: 6 },  // A: S.No
      { width: 18 }, // B: Member Name
      { width: 12 }, // C: Attendance
      { width: 12 }, // D: Saving Deposit
      { width: 14 }, // E: SHG Principal
      { width: 14 }, // F: SHG Interest
      { width: 14 }, // G: Bank Principal
      { width: 14 }, // H: Bank Interest
      { width: 12 }, // I: Penalty
      { width: 12 }, // J: SHG Loan Dist
      { width: 14 }, // K: Bank Loan Dist
      { width: 14 }, // L: Total Saving
      { width: 14 }, // M: SHG Loan
      { width: 14 }  // N: Bank Loan
    ];

    // Row 1
    ws.getCell("A1").value = "SHG ID";
    ws.getCell("A1").fill = fill(cYellow);
    ws.getCell("B1").value = "समूह का नाम";
    ws.getCell("C1").value = "गांव का नाम";
    ws.mergeCells("D1:N1");
    ws.getCell("D1").value = `Month ${state.header.monthLabel || state.header.month}`;
    ws.getCell("D1").fill = fill(cBlue);
    ws.getCell("D1").font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
    
    // Row 2
    ws.getCell("A2").value = state.header.shgId;
    ws.getCell("A2").fill = fill(cYellow);
    ws.getCell("B2").value = state.header.shgName;
    ws.getCell("C2").value = state.header.village;
    
    ws.mergeCells("D2:E2");
    ws.getCell("D2").value = `Meeting Date = ${state.header.meetingDate || ""}`;
    ws.getCell("D2").fill = fill(cPeach);
    
    ws.mergeCells("F2:G2");
    ws.getCell("F2").value = "SHG Loan Recovery";
    ws.getCell("F2").fill = fill(cGreen);
    
    ws.mergeCells("H2:I2");
    ws.getCell("H2").value = "Bank/PMC Loan Recovery";
    ws.getCell("H2").fill = fill(cLightPeach);
    
    ws.getCell("J2").value = "Other";
    
    ws.mergeCells("K2:L2");
    ws.getCell("K2").value = "Loan Distribution";
    ws.getCell("K2").fill = fill(cCyan);
    
    ws.mergeCells("M2:N2");
    ws.getCell("M2").value = "Talpat";
    ws.getCell("M2").fill = fill(cYellow);

    // Row 3 (Headers)
    const headers = [
      "S.No.", "Member Name", "Attendance", "Saving Deposit",
      "Principal Deposit", "Interest Deposit", "Principal Deposit", "Interest Deposit",
      "Penalty etc.", "SHG", "Bank/PMC", "Total Saving", "SHG Loan", "Bank/PMC Loan"
    ];
    headers.forEach((h, i) => {
      const cell = ws.getCell(3, i + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      
      // specific colors
      if (i >= 4 && i <= 5) cell.fill = fill(cGreen);
      if (i >= 6 && i <= 7) cell.fill = fill(cLightPeach);
      if (i >= 9 && i <= 10) cell.fill = fill(cCyan);
    });

    // Apply borders & alignment for top 3 rows
    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 14; c++) {
        ws.getCell(r, c).border = borderAll;
        if (r === 1 || r === 2) ws.getCell(r, c).alignment = center;
      }
    }

    // Data rows
    let rowNum = 4;
    state.members.filter(m => m.name.trim()).forEach((m, i) => {
      const r = ws.getRow(rowNum);
      r.values = [
        i + 1, m.name, m.attendance, n(m.savingDeposit), n(m.shgPrincipalDeposit),
        n(m.shgInterestDeposit), n(m.bankPrincipalDeposit), n(m.bankInterestDeposit),
        n(m.penaltyEtc), n(m.loanDistSHG), n(m.loanDistBankPMC), n(m.totalSaving),
        n(m.shgLoan), n(m.bankPMCLoan)
      ];
      r.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 14) {
          cell.border = borderAll;
          cell.alignment = center;
          if (rowNum % 2 !== 0) cell.fill = fill("FFF0F8FF"); // alternating row color
        }
      });
      rowNum++;
    });

    // Total Row
    const tRow = ws.getRow(rowNum);
    tRow.values = [
      "Total", "", state.members.filter(m => m.attendance === "P").length + " P",
      totals.savingDeposit, totals.shgPrincipalDeposit, totals.shgInterestDeposit,
      totals.bankPrincipalDeposit, totals.bankInterestDeposit, totals.penaltyEtc,
      totals.loanDistSHG, totals.loanDistBankPMC, totals.totalSaving, totals.shgLoan, totals.bankPMCLoan
    ];
    ws.mergeCells(`A${rowNum}:B${rowNum}`);
    tRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 14) {
        cell.border = borderAll;
        cell.alignment = center;
        cell.fill = fill(cGreen);
        cell.font = { bold: true };
      }
    });

    rowNum += 2; // skip a row

    // Summary Tables
    // Meeting Transaction
    ws.mergeCells(`C${rowNum}:F${rowNum}`);
    ws.getCell(`C${rowNum}`).value = "Meeting Transaction";
    ws.getCell(`C${rowNum}`).fill = fill(cBlue);
    ws.getCell(`C${rowNum}`).font = { color: { argb: "FFFFFFFF" }, bold: true };
    ws.getCell(`C${rowNum}`).alignment = center;
    ws.getCell(`C${rowNum}`).border = borderAll;

    // Talpat
    ws.mergeCells(`I${rowNum}:L${rowNum}`);
    ws.getCell(`I${rowNum}`).value = "Talpat";
    ws.getCell(`I${rowNum}`).fill = fill(cYellow);
    ws.getCell(`I${rowNum}`).font = { bold: true };
    ws.getCell(`I${rowNum}`).alignment = center;
    ws.getCell(`I${rowNum}`).border = borderAll;
    
    rowNum++;

    // Income / Expenses headers
    ["C", "I"].forEach(col => { ws.getCell(`${col}${rowNum}`).value = "Income"; ws.getCell(`${col}${rowNum}`).border = borderAll; ws.getCell(`${col}${rowNum}`).alignment = center; });
    ["D", "J"].forEach(col => { ws.getCell(`${col}${rowNum}`).value = ""; ws.getCell(`${col}${rowNum}`).border = borderAll; });
    ["E", "K"].forEach(col => { ws.getCell(`${col}${rowNum}`).value = "Expenses"; ws.getCell(`${col}${rowNum}`).border = borderAll; ws.getCell(`${col}${rowNum}`).alignment = center; });
    ["F", "L"].forEach(col => { ws.getCell(`${col}${rowNum}`).value = ""; ws.getCell(`${col}${rowNum}`).border = borderAll; });

    rowNum++;

    const maxSummaryRows = Math.max(computedCashIncome.length, computedCashExpense.length, computedTalpatIncome.length, computedTalpatExpense.length);
    for (let i = 0; i < maxSummaryRows; i++) {
      const sr = ws.getRow(rowNum);
      // Meeting Transaction
      sr.getCell(3).value = computedCashIncome[i]?.label || "";
      sr.getCell(4).value = computedCashIncome[i] ? n(computedCashIncome[i].amount) : "";
      sr.getCell(5).value = computedCashExpense[i]?.label || "";
      sr.getCell(6).value = computedCashExpense[i] ? n(computedCashExpense[i].amount) : "";
      
      // Talpat
      sr.getCell(9).value = computedTalpatIncome[i]?.label || "";
      sr.getCell(10).value = computedTalpatIncome[i] ? n(computedTalpatIncome[i].amount) : "";
      sr.getCell(11).value = computedTalpatExpense[i]?.label || "";
      sr.getCell(12).value = computedTalpatExpense[i] ? n(computedTalpatExpense[i].amount) : "";

      [3, 4, 5, 6, 9, 10, 11, 12].forEach(col => {
        const c = sr.getCell(col);
        c.border = borderAll;
        if ([4, 6, 10, 12].includes(col)) { c.alignment = { horizontal: "right" }; }
        // Highlight computed income labels with Yellow (like screenshot 'Rec. Loan Bank/PMC =')
        if (col === 3 && [0, 7].includes(i)) c.fill = fill(cYellow);
      });
      rowNum++;
    }

    // Totals for Summary
    const sumTotalRow = ws.getRow(rowNum);
    sumTotalRow.getCell(3).value = "Total="; sumTotalRow.getCell(4).value = cashIncomeTotal;
    sumTotalRow.getCell(5).value = "Total="; sumTotalRow.getCell(6).value = cashExpenseTotal;
    sumTotalRow.getCell(9).value = "Total="; sumTotalRow.getCell(10).value = talpatIncomeTotal;
    sumTotalRow.getCell(11).value = "Total="; sumTotalRow.getCell(12).value = talpatExpenseTotal;
    
    [3, 4, 5, 6, 9, 10, 11, 12].forEach(col => {
      const c = sumTotalRow.getCell(col);
      c.border = borderAll;
      c.font = { bold: true };
      if ([4, 6, 10, 12].includes(col)) {
        c.alignment = { horizontal: "right" };
        c.fill = fill(cGreen);
      }
    });

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SHG_Register_${state.header.shgName}_${state.header.month || "today"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    // Increase scale to 3 for much sharper rendering (prevents faded colors)
    const canvas = await html2canvas(printRef.current, { scale: 3, backgroundColor: "#fff" });
    const img = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pw / canvas.width, ph / canvas.height);
    pdf.addImage(img, "JPEG", (pw - canvas.width * ratio) / 2, (ph - canvas.height * ratio) / 2, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`SHG_Register_${state.header.shgName}_${state.header.month || "today"}.pdf`);
  };

  const handleClear = () => {
    if (confirm("क्या आप पूरा रजिस्टर साफ करना चाहते हैं?")) dispatch({ type: "reset" });
  };

  // ─── Render ──────────────────────────────────────────────────────

  if (view === "manager") {
    return <RegisterManager onBack={() => setView("register")} onLoad={handleLoadRegister} />;
  }

  return (
    <div className="register-page" ref={printRef}>
      {/* Action Bar */}
      <div className="reg-actions" data-html2canvas-ignore="true">
        <button className="btn btn-success" onClick={handleSave}>💾 सुरक्षित करें</button>
        <button className="btn btn-secondary" onClick={() => setView("manager")}>📂 सहेजे गए रजिस्टर</button>
        <button className="btn btn-secondary" onClick={handleExportExcel}>📊 Excel</button>
        <button className="btn btn-secondary" onClick={handleExportPDF}>📄 PDF</button>
        <div className="spacer" />
        <button className="btn btn-danger btn-sm" onClick={handleClear}>🗑️ साफ करें</button>
      </div>

      {/* Header */}
      <div className="reg-header">
        <label>
          SHG चुनें
          <select value={shgs.find((s) => s.name === state.header.shgName)?.id || ""} onChange={(e) => handleSHGChange(e.target.value)}>
            <option value="">— SHG चुनें —</option>
            {shgs.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.shgId})</option>)}
          </select>
        </label>
        <label>SHG ID<input readOnly value={state.header.shgId} /></label>
        <label>गाँव<input readOnly value={state.header.village} /></label>
        <label>ग्राम पंचायत<input readOnly value={state.header.gramPanchayat} /></label>
        <label>Meeting Date<input type="date" value={state.header.meetingDate} onChange={(e) => dispatch({ type: "header", field: "meetingDate", value: e.target.value })} /></label>
        <label>Meeting No.<input value={state.header.meetingNo} onChange={(e) => dispatch({ type: "header", field: "meetingNo", value: e.target.value })} /></label>
        <label>Month<input value={state.header.monthLabel || state.header.month} onChange={(e) => dispatch({ type: "header", field: "monthLabel", value: e.target.value })} /></label>
        {savedMonths.length > 0 && (
          <label>
            पिछला डेटा लोड करें
            <select onChange={(e) => {
              if (!e.target.value) return;
              const regs = loadSavedRegisters().filter((r) => r.header.shgName === state.header.shgName && r.month === e.target.value);
              if (regs.length > 0) handleLoadRegister(regs[regs.length - 1]);
            }}>
              <option value="">— चुनें —</option>
              {savedMonths.map((m) => <option key={m} value={m}>{formatMonthEnglish(m)}</option>)}
            </select>
          </label>
        )}
      </div>

      {/* Column Group Band */}
      <div className="reg-band">
        <span className="tag">बचत रजिस्टर</span>
        <span className="talpat">Talpat</span>
      </div>

      {/* Main Data Table */}
      <table className="reg">
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "3%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>S.No.</th>
            <th rowSpan={2}>Member Name</th>
            <th rowSpan={2}></th>
            <th rowSpan={2} className="col-saving">Saving<br/>Deposit</th>
            <th colSpan={2} className="col-shg-recovery">SHG Loan Recovery</th>
            <th colSpan={2} className="col-bank-recovery">Bank/PMC Loan Recovery</th>
            <th rowSpan={2}>Other</th>
            <th colSpan={2} className="col-loan-dist">Loan Distribution</th>
            <th colSpan={3} className="col-talpat">Talpat</th>
            <th rowSpan={2}></th>
          </tr>
          <tr>
            <th className="col-shg-recovery">Principal<br/>Deposit</th>
            <th className="col-shg-recovery">Interest<br/>Deposit</th>
            <th className="col-bank-recovery">Principal<br/>Deposit</th>
            <th className="col-bank-recovery">Interest<br/>Deposit</th>
            <th className="col-loan-dist">SHG</th>
            <th className="col-loan-dist">Bank/PMC</th>
            <th className="col-talpat">Total Saving</th>
            <th className="col-talpat">SHG Loan</th>
            <th className="col-talpat">Bank/<br/>PMC Loan</th>
          </tr>
          <tr className="sub-header-row">
            <th></th>
            <th>Member Name</th>
            <th>Attendance</th>
            <th></th><th></th><th></th><th></th><th></th>
            <th>Penalty<br/>etc.</th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          {state.members.map((m, i) => (
            <tr key={m.id}>
              <td>{i + 1}</td>
              <td className="name">
                <input data-row={i} data-col="name" value={m.name} onChange={(e) => dispatch({ type: "member", index: i, field: "name", value: e.target.value })} onKeyDown={(e) => handleKeyDown(e, i, "name")} />
              </td>
              <td>
                <select data-row={i} data-col="attendance" value={m.attendance} onChange={(e) => dispatch({ type: "member", index: i, field: "attendance", value: e.target.value })} onKeyDown={(e) => handleKeyDown(e, i, "attendance")}>
                  <option value="">-</option>
                  <option value="P">P</option>
                  <option value="A">A</option>
                </select>
              </td>
              {(["savingDeposit", "shgPrincipalDeposit", "shgInterestDeposit", "bankPrincipalDeposit", "bankInterestDeposit", "penaltyEtc", "loanDistSHG", "loanDistBankPMC", "totalSaving", "shgLoan", "bankPMCLoan"] as const).map((f) => {
                const isComputed = ["totalSaving", "shgLoan", "bankPMCLoan"].includes(f);
                return (
                  <td key={f}>
                    <input 
                      data-row={i} 
                      data-col={f} 
                      inputMode="decimal" 
                      value={m[f] as any} 
                      className={isComputed ? "computed" : ""}
                      onChange={(e) => dispatch({ type: "member", index: i, field: f, value: e.target.value })} 
                      onKeyDown={(e) => handleKeyDown(e, i, f)} 
                      title={isComputed ? "Auto-calculated, but can be manually changed" : ""}
                    />
                  </td>
                );
              })}
              <td><button className="row-del" title="हटाएँ" onClick={() => dispatch({ type: "delMember", index: i })}>✕</button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Total</td>
            <td style={{ textAlign: "center", fontWeight: "bold" }}>
              {state.members.filter((m) => m.attendance === "P").length} P
            </td>
            <td>{fmt(totals.savingDeposit)}</td>
            <td>{fmt(totals.shgPrincipalDeposit)}</td>
            <td>{fmt(totals.shgInterestDeposit)}</td>
            <td>{fmt(totals.bankPrincipalDeposit)}</td>
            <td>{fmt(totals.bankInterestDeposit)}</td>
            <td>{fmt(totals.penaltyEtc)}</td>
            <td>{fmt(totals.loanDistSHG)}</td>
            <td>{fmt(totals.loanDistBankPMC)}</td>
            <td>{fmt(totals.totalSaving)}</td>
            <td>{fmt(totals.shgLoan)}</td>
            <td>{fmt(totals.bankPMCLoan)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} data-html2canvas-ignore="true" onClick={() => dispatch({ type: "addMember" })}>+ सदस्य जोड़ें</button>

      {/* ─── Meeting Transaction + Talpat Summary ─── */}
      <div className="summary-wrap">
        {/* Cash / Meeting Transaction */}
        <div>
          <table className="summary">
            <thead>
              <tr><th colSpan={4} style={{ background: "var(--excel-blue)", color: "#fff", borderBottom: "1px solid #000" }}>Meeting Transaction</th></tr>
              <tr><th style={{ width: "35%" }}>Income</th><th style={{ width: "15%" }}></th><th style={{ width: "35%" }}>Expenses</th><th style={{ width: "15%" }}></th></tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(computedCashIncome.length, finalCashExpense.length) }).map((_, i) => (
                <tr key={i}>
                  <td className="label">{computedCashIncome[i]?.label ?? ""}</td>
                  <td className="amount">
                    {computedCashIncome[i] && (
                      <input inputMode="decimal" value={computedCashIncome[i].amount as any} readOnly={isComputedCashIncome(i)} className={isComputedCashIncome(i) ? "computed" : ""} onChange={(e) => dispatch({ type: "cashIncome", index: i, value: e.target.value })} />
                    )}
                  </td>
                  <td className="label">{finalCashExpense[i]?.label ?? ""}</td>
                  <td className="amount">
                    {finalCashExpense[i] && (
                      <input inputMode="decimal" value={finalCashExpense[i].amount as any} readOnly={isComputedCashExpense(i)} className={isComputedCashExpense(i) ? "computed" : ""} onChange={(e) => dispatch({ type: "cashExpense", index: i, value: e.target.value })} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>Total=</td>
                <td style={{ background: "#82f082", fontWeight: "bold", textAlign: "center" }}>{fmt(cashIncomeTotal)}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>Total=</td>
                <td style={{ background: "#82f082", fontWeight: "bold", textAlign: "center" }}>{fmt(cashIncomeTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Talpat */}
        <div>
          <table className="summary">
            <thead>
              <tr><th colSpan={4} className="talpat-header" style={{ borderBottom: "1px solid #000" }}>Talpat</th></tr>
              <tr>
                <th colSpan={2} style={{ width: "50%", background: "#f8fafc", color: "#000" }}>Saving =<span className="th-val" style={{ color: "var(--accent-blue)" }}>{fmt(totals.totalSaving)}</span></th>
                <th colSpan={2} style={{ width: "50%", background: "#f8fafc", color: "#000" }}>SHG Loan =<span className="th-val" style={{ color: "var(--accent-blue)" }}>{fmt(totals.shgLoan)}</span></th>
              </tr>
              <tr><th style={{ width: "35%" }}>Income</th><th style={{ width: "15%" }}></th><th style={{ width: "35%" }}>Expenses</th><th style={{ width: "15%" }}></th></tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(computedTalpatIncome.length, finalTalpatExpense.length) }).map((_, i) => (
                <tr key={i}>
                  <td className="label">{computedTalpatIncome[i]?.label ?? ""}</td>
                  <td className="amount">
                    {computedTalpatIncome[i] && (
                      <input inputMode="decimal" value={computedTalpatIncome[i].amount as any} readOnly={isComputedTalpatIncome(i)} className={isComputedTalpatIncome(i) ? "computed" : ""} onChange={(e) => dispatch({ type: "talpatIncome", index: i, value: e.target.value })} />
                    )}
                  </td>
                  <td className="label">{finalTalpatExpense[i]?.label ?? ""}</td>
                  <td className="amount">
                    {finalTalpatExpense[i] && (
                      <input inputMode="decimal" value={finalTalpatExpense[i].amount as any} readOnly={isComputedTalpatExpense(i)} className={isComputedTalpatExpense(i) ? "computed" : ""} onChange={(e) => dispatch({ type: "talpatExpense", index: i, value: e.target.value })} />
                    )}
                  </td>
                </tr>
              ))}
              <tr className="total">
                <td className="label">Total=</td>
                <td className="amount">{fmt(talpatIncomeTotal)}</td>
                <td className="label">Total=</td>
                <td className="amount">{fmt(talpatExpenseTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Closing Cash */}
      <div className="closing-cash">
        <span>आज का नकद शेष (Closing Cash):</span>
        <span className="val">₹ {fmt(closingCash)}</span>
      </div>
    </div>
  );
}