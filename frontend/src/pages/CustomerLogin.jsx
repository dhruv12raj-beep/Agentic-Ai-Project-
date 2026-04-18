import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function CustomerLogin({ isExecutive = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const endpoint = isExecutive
    ? "/auth/executive/login"
    : "/auth/customer/login";

  const redirectTo = isExecutive ? "/executive/dashboard" : "/dashboard";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(endpoint, form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", isExecutive ? "executive" : "customer");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful");
      navigate(redirectTo);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge(isExecutive)}>
          {isExecutive ? "Executive Portal" : "Customer Portal"}
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.button(isExecutive)} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {!isExecutive && (
          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>Register here</Link>
          </p>
        )}

        {!isExecutive && (
          <p style={styles.footer}>
            Are you an executive?{" "}
            <Link to="/executive/login" style={styles.link}>Login here</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e5e5e5",
  },
  badge: (isExecutive) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "20px",
    background: isExecutive ? "#f0edfe" : "#e6f1fb",
    color: isExecutive ? "#534ab7" : "#185fa5",
  }),
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#444",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
    background: "#fafafa",
  },
  button: (isExecutive) => ({
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "6px",
    background: isExecutive ? "#534ab7" : "#185fa5",
    color: "#fff",
    transition: "opacity 0.2s",
  }),
  footer: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
  },
  link: {
    color: "#185fa5",
    textDecoration: "none",
    fontWeight: "500",
  },
};