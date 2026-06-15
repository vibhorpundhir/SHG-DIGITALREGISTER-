import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouterState,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { seedDemoData } from "@/lib/seed";
import { clearAllData } from "@/lib/store";
import { isLoggedIn, logOut, getCurrentUser } from "@/lib/auth";

import appCss from "../styles.css?url";
import shellCss from "../components/app-shell.css?url";

function NotFoundComponent() {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", color: "#8b95b0" }}>
      <h1 style={{ fontSize: "64px", fontWeight: 800, color: "#e8ecf4" }}>404</h1>
      <p style={{ marginTop: 8, fontSize: 14 }}>पेज नहीं मिला</p>
      <Link to="/" style={{ display: "inline-block", marginTop: 16, padding: "8px 20px", background: "#4f8cf7", color: "#fff", borderRadius: 6, fontWeight: 600, fontSize: 13 }}>
        🏠 होम पर जाएँ
      </Link>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "SHG डिजिटल रजिस्टर" },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700&display=swap",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: shellCss },
        {
          rel: "icon",
          href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📒</text></svg>",
        },
      ],
    }),
    notFoundComponent: NotFoundComponent,
    component: RootComponent,
  },
);

// ─── Pages that don't need login ────────────────────────────
const PUBLIC_PATHS = ["/", "/login"];

function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = getCurrentUser();

  const navItems = [
    { to: "/", label: "🏠 होमपेज", icon: "🏠" },
    { to: "/register", label: "📒 बचत रजिस्टर", icon: "📒" },
    { to: "/gram-panchayat", label: "🏛️ ग्राम पंचायत", icon: "🏛️" },
    { to: "/village", label: "🏘️ गाँव", icon: "🏘️" },
    { to: "/shg", label: "👥 SHG समूह", icon: "👥" },
    { to: "/member", label: "👤 सदस्य", icon: "👤" },
    { to: "/reports", label: "📊 रिपोर्ट्स", icon: "📊" },
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand" style={{ padding: "20px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "4px" }}>
            <img 
              src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg" 
              alt="SPECTRA Logo" 
              style={{ width: "160px", height: "auto", objectFit: "contain" }} 
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.getElementById("spectra-fallback-text");
                if (fallback) fallback.style.display = "block";
              }}
            />
            <h2 id="spectra-fallback-text" style={{ 
              display: "none",
              fontSize: "24px", 
              fontWeight: 800, 
              color: "var(--accent-blue)", 
              letterSpacing: "0.5px",
              fontFamily: "'Inter', sans-serif",
              margin: 0
            }}>SPECTRA<sup style={{ fontSize: "10px", fontWeight: "bold" }}>®</sup></h2>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", fontWeight: 600, letterSpacing: "0.5px" }}>
            SHG DIGITAL REGISTER
          </p>
        </div>

        {/* Logged-in user info */}
        {user && (
          <div style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-blue), var(--accent-green))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">मुख्य मेनू</div>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${currentPath === item.to ? "active" : ""}`}
                onClick={onClose}
              >
                <span className="icon">{item.icon}</span>
                {item.label.split(" ").slice(1).join(" ")}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            className="demo-btn"
            onClick={() => {
              if (confirm("यह सारा मौजूदा डेटा मिटाकर नया डेमो डेटा भरेगा। जारी रखें?")) {
                seedDemoData();
                window.location.reload();
              }
            }}
          >
            📦 डेमो डेटा लोड करें
          </button>
          <button
            className="clear-btn"
            onClick={() => {
              if (confirm("⚠️ सारा डेटा हमेशा के लिए मिट जाएगा! जारी रखें?")) {
                clearAllData();
                window.location.reload();
              }
            }}
          >
            🗑️ सारा डेटा मिटाएं
          </button>
          <button
            className="clear-btn"
            style={{
              marginTop: "6px",
              borderColor: "rgba(35, 121, 219, 0.3)",
              color: "var(--accent-blue)",
            }}
            onClick={() => {
              if (confirm("क्या आप Logout करना चाहते हैं?")) {
                logOut();
                navigate({ to: "/" });
              }
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isPublicPage = PUBLIC_PATHS.includes(currentPath);
  const isLoginPage = currentPath === "/login";

  // Auth guard: protected pages redirect to /login if not logged in
  useEffect(() => {
    if (!isPublicPage && !isLoggedIn()) {
      navigate({ to: "/login" });
    }
  }, [currentPath, isPublicPage, navigate]);

  // Login page: render without sidebar/shell
  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <HeadContent />
        <Outlet />
        <Scripts />
      </QueryClientProvider>
    );
  }

  // Homepage: render with sidebar if logged in, without sidebar if not
  if (currentPath === "/" && !isLoggedIn()) {
    return (
      <QueryClientProvider client={queryClient}>
        <HeadContent />
        <Outlet />
        <Scripts />
      </QueryClientProvider>
    );
  }

  // All other pages & logged-in homepage: full app shell with sidebar
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="app-shell">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <Scripts />
    </QueryClientProvider>
  );
}
