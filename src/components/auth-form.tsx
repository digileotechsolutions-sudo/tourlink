"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type PendingVerification = { userId: string; email: string; phone: string | null; emailVerified: boolean; phoneVerified: boolean; devOtps?: { email?: string; phone?: string } };

export function AuthForm({ mode, successPath, initialRole }: { mode: "login" | "register"; successPath?: string; initialRole?: "TRAVELER" | "OPERATOR" | "VEHICLE_OWNER" }) {
  const router = useRouter();
  const [role, setRole] = useState<string>(initialRole || "TRAVELER");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [pending, setPending] = useState<PendingVerification | null>(null);
  const [codes, setCodes] = useState({ email: "", phone: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => { if (typeof window !== "undefined" && mode === "login") return localStorage.getItem("rememberMe") === "true"; return false; });

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setNotice("");
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "register" ? { ...form, role } : { email: form.email, password: form.password }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { if (data.verificationRequired) { setPending({ userId: data.user.id, email: data.user.email, phone: data.user.phone, emailVerified: !data.needs.email, phoneVerified: !data.needs.phone }); setNotice(data.error); } else setError(data.error || "Something went wrong"); return; }
    if (data.verificationRequired) { setPending({ userId: data.user.id, email: data.user.email, phone: data.user.phone, emailVerified: false, phoneVerified: false, devOtps: data.devOtps }); setNotice("Verification codes sent to your email and phone."); return; }
    router.push(successPath || (data.user?.role === "ADMIN" ? "/admin" : "/dashboard")); if (rememberMe) localStorage.setItem("rememberMe", "true"); else localStorage.removeItem("rememberMe"); router.refresh();
  }

  async function verify(channel: "EMAIL" | "PHONE") { if (!pending) return; const key = channel.toLowerCase() as "email" | "phone"; setLoading(true); setError(""); const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: pending.userId, channel, code: codes[key] }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "That code could not be verified."); return; } const next = { ...pending, emailVerified: data.emailVerified, phoneVerified: data.phoneVerified }; setPending(next); setCodes(current => ({ ...current, [key]: "" })); if (data.authenticated) { router.push("/dashboard"); router.refresh(); } else if (data.pendingApproval) setNotice("Email and phone verified. Your account is now waiting for admin approval."); else setNotice(`${channel === "EMAIL" ? "Email" : "Phone"} verified. Verify the remaining contact method.`); }
  async function resend(channel: "EMAIL" | "PHONE") { if (!pending) return; setLoading(true); setError(""); const response = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: pending.userId, channel }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Code could not be resent."); return; } const key = channel.toLowerCase() as "email" | "phone"; setPending(current => current ? { ...current, devOtps: { ...current.devOtps, [key]: data.devOtp } } : current); setNotice(`A new ${channel === "EMAIL" ? "email" : "SMS"} code was sent.`); }
  if (pending) return (
    <div className="login-page">
      <div className="auth-wrapper auth-verification-wrapper">
        <div className="auth-left">
          <div className="auth-brand-mark">TL</div>
          <span className="auth-kicker">One more step</span>
          <h1>Verify your contacts</h1>
          <p>Enter the two six-digit codes we sent to confirm your email address and phone number.</p>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Confirm account</h2>
              <p className="auth-subtitle">Codes expire after 10 minutes.</p>
            </div>
            {notice && <p className="auth-msg auth-msg-notice">{notice}</p>}
            {error && <p className="auth-msg auth-msg-error">{error}</p>}
            {(["EMAIL", "PHONE"] as const).map(channel => {
              const key = channel.toLowerCase() as "email" | "phone";
              const verified = channel === "EMAIL" ? pending.emailVerified : pending.phoneVerified;
              const recipient = channel === "EMAIL" ? pending.email : pending.phone;
              return <div className="auth-verify-group" key={channel}>
                <div className="auth-verify-heading"><div><strong>{channel === "EMAIL" ? "Email code" : "Phone code"}</strong><span>{recipient}</span></div><span className={verified ? "auth-verify-status is-verified" : "auth-verify-status"}>{verified ? "Verified" : "Pending"}</span></div>
                {!verified && <div className="auth-verify-controls"><input aria-label={`${channel === "EMAIL" ? "Email" : "Phone"} verification code`} inputMode="numeric" maxLength={6} placeholder="000000" value={codes[key]} onChange={event => setCodes(current => ({ ...current, [key]: event.target.value.replace(/\D/g, "") }))} /><button type="button" onClick={() => verify(channel)} disabled={loading || codes[key].length !== 6}>Verify</button><button type="button" className="auth-resend" onClick={() => resend(channel)} disabled={loading}>Resend</button></div>}
                {pending.devOtps?.[key] && !verified && <p className="auth-dev-code">Development code: <strong>{pending.devOtps[key]}</strong></p>}
              </div>;
            })}
            <p className="auth-footer">Already verified? <Link href="/login">Go to sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-brand-mark">TL</div>
          <span className="auth-kicker">Travel with confidence</span>
          <h1>{mode === "login" ? "Welcome back" : "Your next journey starts here"}</h1>
          <p>{mode === "login" ? "Pick up where you left off and keep every trip in one place." : "Join a trusted community for memorable trips, local operators, and easy vehicle hire."}</p>
          <div className="auth-feature-list" aria-hidden="true">
            <span>Curated Kenyan experiences</span>
            <span>Trusted local providers</span>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{mode === "login" ? "Sign in" : "Create Account"}</h2>
              <p className="auth-subtitle">{mode === "login" ? "Access your bookings, favorites, and messages." : "Set up your TourLink account in a minute."}</p>
            </div>

            <form onSubmit={submit}>
              {mode === "register" && (
                <div className="auth-field">
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Amina Kariuki"
                    value={form.name}
                    onChange={event => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="xixi_yu@yijing.com"
                  value={form.email}
                  onChange={event => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>

              {mode === "register" && (
                <div className="auth-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="0712345678"
                    value={form.phone}
                    onChange={event => setForm({ ...form, phone: event.target.value })}
                    required
                  />
                </div>
              )}

              <div className={`auth-field auth-field-password${mode === "login" ? " auth-field-password-show" : ""}`}>
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={event => setForm({ ...form, password: event.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>

              {mode === "register" && (
                <div className="auth-field auth-field-select">
                  <label htmlFor="role">Account type</label>
                  <select
                    id="role"
                    value={role}
                    onChange={event => setRole(event.target.value)}
                  >
                    <option value="TRAVELER">Traveler</option>
                    <option value="OPERATOR">Tour operator</option>
                    <option value="VEHICLE_OWNER">Vehicle owner</option>
                  </select>
                </div>
              )}

              {error && <p className="auth-msg auth-msg-error">{error}</p>}
              {notice && <p className="auth-msg auth-msg-notice">{notice}</p>}

              <div className="auth-actions">
                {mode === "login" && (
                  <button type="button" onClick={() => {
                    alert('Password reset instructions have been sent to your registered email.');
                  }} className="auth-forgot">Forgot password?</button>
                )}
                {mode === "login" && (
                  <div className="auth-form-check">
                    <input
                      type="checkbox"
                      id="remember-me"
                      name="remember-me"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="remember-me">Remember me</label>
                  </div>
                )}
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading && <span />}
                  <span>{mode === "login" ? "Sign in" : "Create account"}</span>
                  <span aria-hidden="true">&#8594;</span>
                </button>
              </div>
            </form>

            <p className="auth-footer">
              {mode === "login" ? "New to TourLink? " : "Already have an account? "}
              <Link href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create an account" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}