import { Link } from "@tanstack/react-router";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import {
  useGPs,
  useVillages,
  useSHGs,
  useMembers,
  useRegisters,
  formatMonthHindi,
  getCurrentMonth,
} from "@/lib/store";

import "../components/homepage.css";

/** Get Hindi greeting based on time of day */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "सुप्रभात";
  if (h < 17) return "नमस्कार";
  return "शुभ संध्या";
}

/** Format today's date in Hindi */
function getTodayHindi(): string {
  const months: Record<string, string> = {
    "01": "जनवरी", "02": "फरवरी", "03": "मार्च",
    "04": "अप्रैल", "05": "मई", "06": "जून",
    "07": "जुलाई", "08": "अगस्त", "09": "सितंबर",
    "10": "अक्टूबर", "11": "नवंबर", "12": "दिसंबर",
  };
  const d = new Date();
  const day = d.getDate();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day} ${months[m]} ${y}`;
}

/** Public homepage — shown when not logged in */
function PublicHomepage() {
  return (
    <div className="login-page" style={{ flexDirection: "column", gap: "0" }}>
      {/* Blurred Background Logo */}
      <img
        className="login-bg-logo"
        src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg"
        alt=""
        aria-hidden="true"
      />

      {/* Floating Particles */}
      <div className="login-particles">
        <span /><span /><span /><span /><span /><span />
      </div>

      {/* Hero Card */}
      <div className="login-card" style={{ maxWidth: "520px", textAlign: "center" }}>
        <div className="login-logo-wrapper">
          <img
            className="login-logo-img"
            src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg"
            alt="SPECTRA Logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <h1 className="login-title" style={{ fontSize: "26px" }}>
            SHG Digital Register
          </h1>
          <p className="login-subtitle" style={{ marginTop: "8px" }}>
            Society for Public Education Cultural Training & Rural Action
          </p>
        </div>

        {/* Description */}
        <div style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "13px",
          lineHeight: "1.7",
          marginBottom: "24px",
          padding: "0 8px",
        }}>
          <p style={{ margin: "0 0 12px" }}>
            स्वयं सहायता समूहों (SHG) के <span style={{ color: "#86efac", fontWeight: 600 }}>मासिक बचत</span>,{" "}
            <span style={{ color: "#86efac", fontWeight: 600 }}>ऋण वितरण</span> और{" "}
            <span style={{ color: "#86efac", fontWeight: 600 }}>वसूली</span> को डिजिटल रूप में प्रबंधित करें।
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {["📒 बचत रजिस्टर", "📊 रिपोर्ट्स", "📥 Excel Export", "📄 PDF Export"].map((tag) => (
              <span key={tag} style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <Link
          to="/login"
          className="login-submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            gap: "8px",
          }}
        >
          🔑 Login करें — सिस्टम एक्सेस करें
        </Link>

        {/* Divider */}
        <div className="login-divider" style={{ margin: "20px 0 12px" }}>
          <span>SPECTRA • Alwar, Rajasthan</span>
        </div>

        {/* Footer */}
        <div className="login-footer" style={{ marginTop: "8px", paddingTop: "12px" }}>
          <p>
            Powered by{" "}
            <a href="https://spectraalwar.org/" target="_blank" rel="noopener noreferrer">
              SPECTRA
            </a>{" "}
            — Empowering Rural Communities
          </p>
        </div>
      </div>
    </div>
  );
}

/** Dashboard homepage — shown when logged in */
function DashboardHomepage() {
  const user = getCurrentUser();
  const { data: gps = [], isLoading: loadingGPs } = useGPs();
  const { data: villages = [], isLoading: loadingVillages } = useVillages();
  const { data: shgs = [], isLoading: loadingSHGs } = useSHGs();
  const { data: members = [], isLoading: loadingMembers } = useMembers();
  const { data: registers = [], isLoading: loadingRegisters } = useRegisters();
  
  const currentMonth = getCurrentMonth();
  const currentMonthLabel = formatMonthHindi(currentMonth);

  if (loadingGPs || loadingVillages || loadingSHGs || loadingMembers || loadingRegisters) {
    return <div className="p-8 text-center">लोड हो रहा है...</div>;
  }

  const thisMonthRegisters = registers.filter((r) => r.month === currentMonth);

  // Compute total savings from latest register per SHG
  let totalSavings = 0;
  const shgNames = new Set(shgs.map((s) => s.name));
  for (const name of shgNames) {
    const shgRegs = registers
      .filter((r) => r.header.shgName === name)
      .sort((a, b) => (a.header.meetingDate || "").localeCompare(b.header.meetingDate || ""));
    if (shgRegs.length > 0) {
      const latest = shgRegs[shgRegs.length - 1];
      for (const m of latest.members) {
        totalSavings += typeof m.totalSaving === "number" ? m.totalSaving : 0;
      }
    }
  }

  return (
    <div>
      {/* ─── Hero Welcome Banner ─── */}
      <div className="home-hero">
        <div className="home-hero-content">
          <img
            className="home-hero-logo"
            src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg"
            alt="SPECTRA Logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="home-hero-text">
            <h1>SHG Digital Register</h1>
            <p>Society for Public Education Cultural Training & Rural Action</p>
            {user && (
              <div className="home-hero-greeting">
                {getGreeting()}, <span>{user.name}</span> 🙏
              </div>
            )}
            <div className="home-hero-date">📅 {getTodayHindi()} • {currentMonthLabel}</div>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="home-stats-grid">
        <div className="home-stat-card">
          <div className="home-stat-icon blue">🏛️</div>
          <div className="home-stat-info">
            <h3>{gps.length}</h3>
            <p>ग्राम पंचायत</p>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon green">👥</div>
          <div className="home-stat-info">
            <h3>{shgs.length}</h3>
            <p>SHG समूह</p>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon purple">👤</div>
          <div className="home-stat-info">
            <h3>{members.length}</h3>
            <p>कुल सदस्य</p>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon orange">📒</div>
          <div className="home-stat-info">
            <h3>{registers.length}</h3>
            <p>सहेजे गए रजिस्टर</p>
          </div>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <h2 className="home-section-title">⚡ Quick Actions <span className="badge">शॉर्टकट</span></h2>
      <div className="home-quick-actions">
        <Link to="/register" className="home-quick-action">
          <div className="qa-icon">📒</div>
          <div className="qa-text">
            <h4>बचत रजिस्टर</h4>
            <p>मासिक बचत दर्ज करें</p>
          </div>
        </Link>
        <Link to="/shg" className="home-quick-action">
          <div className="qa-icon">👥</div>
          <div className="qa-text">
            <h4>SHG समूह</h4>
            <p>नया समूह जोड़ें या देखें</p>
          </div>
        </Link>
        <Link to="/member" className="home-quick-action">
          <div className="qa-icon">👤</div>
          <div className="qa-text">
            <h4>सदस्य प्रबंधन</h4>
            <p>सदस्य जोड़ें / संपादित करें</p>
          </div>
        </Link>
        <Link to="/reports" className="home-quick-action">
          <div className="qa-icon">📊</div>
          <div className="qa-text">
            <h4>रिपोर्ट्स</h4>
            <p>समूह व सदस्य रिपोर्ट</p>
          </div>
        </Link>
        <Link to="/gram-panchayat" className="home-quick-action">
          <div className="qa-icon">🏛️</div>
          <div className="qa-text">
            <h4>ग्राम पंचायत</h4>
            <p>पंचायत प्रबंधित करें</p>
          </div>
        </Link>
        <Link to="/village" className="home-quick-action">
          <div className="qa-icon">🏘️</div>
          <div className="qa-text">
            <h4>गाँव</h4>
            <p>गाँव जोड़ें / देखें</p>
          </div>
        </Link>
      </div>

      {/* ─── Two-Column: About + System Info ─── */}
      <div className="home-two-col">
        <div className="home-about-card">
          <h2 className="home-section-title">🏢 SPECTRA के बारे बारे में</h2>
          <p>
            <span className="highlight">SPECTRA</span> (Society for Public Education Cultural Training and Rural Action)
            अलवर, राजस्थान में स्थित एक प्रमुख गैर-सरकारी संगठन है जो{" "}
            <span className="highlight">महिला सशक्तिकरण</span>, स्वास्थ्य, शिक्षा और आजीविका के क्षेत्र में
            ग्रामीण समुदायों को सशक्त बना रहा है।
          </p>
          <p>
            यह <span className="highlight">SHG Digital Register</span> ऐप स्वयं सहायता समूहों के मासिक लेन-देन को
            डिजिटल रूप में संग्रहीत करने, स्वचालित गणना, और Excel/PDF निर्यात की सुविधा प्रदान करता है।
          </p>
          <div style={{ marginTop: "12px" }}>
            <span className="home-about-tag">महिला सशक्तिकरण</span>
            <span className="home-about-tag">ग्रामीण विकास</span>
            <span className="home-about-tag">SHG प्रबंधन</span>
            <span className="home-about-tag">डिजिटल रजिस्टर</span>
          </div>
        </div>

        <div className="home-info-card">
          <h2 className="home-section-title">📋 सिस्टम जानकारी</h2>
          <ul className="home-info-list">
            <li>
              <span className="label">🏘️ गाँव</span>
              <span className="value">{villages.length}</span>
            </li>
            <li>
              <span className="label">📒 इस माह रजिस्टर</span>
              <span className="value">{thisMonthRegisters.length}</span>
            </li>
            <li>
              <span className="label">💰 कुल बचत (नवीनतम)</span>
              <span className="value">₹{totalSavings.toLocaleString("en-IN")}</span>
            </li>
            <li>
              <span className="label">📅 वर्तमान माह</span>
              <span className="value">{currentMonthLabel}</span>
            </li>
            <li>
              <span className="label">👤 लॉगिन</span>
              <span className="value">{user?.email || "—"}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ─── Footer Banner ─── */}
      <div className="home-footer-banner">
        <p>
          Powered by{" "}
          <a href="https://spectraalwar.org/" target="_blank" rel="noopener noreferrer">SPECTRA</a>
          {" "}— Empowering Rural Communities | अलवर, राजस्थान
        </p>
      </div>
    </div>
  );
}

/** Main Homepage — shows public landing or dashboard based on auth */
export function Homepage() {
  const loggedIn = typeof window !== "undefined" ? isLoggedIn() : false;

  if (!loggedIn) {
    return <PublicHomepage />;
  }

  return <DashboardHomepage />;
}
