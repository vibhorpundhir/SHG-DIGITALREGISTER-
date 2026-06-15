import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { logIn, isLoggedIn } from "@/lib/auth";

import loginCss from "../components/login.css?url";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "SPECTRA — Login" },
      {
        name: "description",
        content:
          "Login to SPECTRA SHG Digital Register. Manage Self Help Group savings and records.",
      },
    ],
    links: [{ rel: "stylesheet", href: loginCss }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  if (typeof window !== "undefined" && isLoggedIn()) {
    navigate({ to: "/" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Brief delay for premium feel
    await new Promise((r) => setTimeout(r, 500));

    const result = logIn(email, password);

    if (result === true) {
      navigate({ to: "/" });
    } else {
      setError(result);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Blurred Background Logo */}
      <img
        className="login-bg-logo"
        src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg"
        alt=""
        aria-hidden="true"
      />

      {/* Floating Particles */}
      <div className="login-particles">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        {/* Logo & Branding */}
        <div className="login-logo-wrapper">
          <img
            className="login-logo-img"
            src="https://spectraalwar.org/wp-content/uploads/2026/01/SPECTRA-Logo-R.jpeg"
            alt="SPECTRA Logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="login-title">SHG Digital Register</h1>
          <p className="login-subtitle">
            Society for Public Education Cultural Training & Rural Action
          </p>
        </div>

        {/* Login Label */}
        <div style={{
          textAlign: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            background: "linear-gradient(135deg, #2379db, #008728)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.3px",
            boxShadow: "0 4px 15px rgba(35, 121, 219, 0.3)",
          }}>
            🔑 Admin Login
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Error Display */}
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="login-field">
            <span className="login-field-icon">✉️</span>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="ईमेल आईडी (Email ID)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="login-field">
            <span className="login-field-icon">🔒</span>
            <input
              id="login-password"
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="पासवर्ड (Password)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading && <span className="login-spinner" />}
            {loading ? "कृपया प्रतीक्षा करें..." : "🚀 Login करें"}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>SPECTRA • Alwar, Rajasthan</span>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Powered by{" "}
            <a
              href="https://spectraalwar.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              SPECTRA
            </a>{" "}
            — Empowering Rural Communities
          </p>
        </div>
      </div>
    </div>
  );
}
