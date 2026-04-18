import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/customer/register", form);
      toast.success("Account created! Please login.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>Customer Portal</div>

        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Get started with support</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/" style={styles.link}>Login here</Link>
        </p>
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
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "20px",
    background: "#e6f1fb",
    color: "#185fa5",
  },
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
    background: "#fafafa",
  },
  button: {
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "6px",
    background: "#185fa5",
    color: "#fff",
  },
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