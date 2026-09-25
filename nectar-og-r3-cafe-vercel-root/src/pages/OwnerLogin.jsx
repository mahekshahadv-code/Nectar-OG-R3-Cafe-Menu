import React from "react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user) return <Navigate to="/owner" replace />;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/owner");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="mini-logo">OG</div>
        <p className="eyebrow">NECTAR OG R3 CAFE</p>
        <h1>Owner Login</h1>
        <p>Manage menu, prices and live orders.</p>

        <form onSubmit={submit} className="form-grid">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <a href="/menu" className="back-link">← Back to customer menu</a>
      </div>
    </div>
  );
}
