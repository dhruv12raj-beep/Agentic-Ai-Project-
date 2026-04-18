import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function RaiseTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", description: "" });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/tickets/", form);
      toast.success("Ticket submitted! Our AI agent is analysing it.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>Support Portal</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>{user.name}</span>
          <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>
            My Tickets
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Raise a ticket</h1>
          <p style={styles.subtitle}>
            Describe your issue and our AI agent will analyse and respond shortly.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Subject</label>
              <input
                style={styles.input}
                type="text"
                name="subject"
                placeholder="Brief summary of your issue"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                name="description"
                placeholder="Describe your issue in detail — what happened, when, and any relevant order or account information..."
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
              />
            </div>

            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>i</span>
              <p style={styles.infoText}>
                Priority and category will be automatically assigned by our AI agent based on your description.
              </p>
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
  },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#185fa5",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navUser: {
    fontSize: "14px",
    color: "#444",
  },
  navBtn: {
    padding: "7px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    color: "#444",
  },
  logoutBtn: {
    padding: "7px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#f5f5f5",
    fontSize: "13px",
    cursor: "pointer",
    color: "#666",
  },
  container: {
    maxWidth: "680px",
    margin: "40px auto",
    padding: "0 20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "28px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    background: "#fafafa",
    resize: "vertical",
    lineHeight: "1.6",
  },
  infoBox: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    background: "#e6f1fb",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  infoIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#185fa5",
    color: "#fff",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: "600",
    lineHeight: "18px",
    textAlign: "center",
  },
  infoText: {
    fontSize: "13px",
    color: "#185fa5",
    lineHeight: "1.5",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    color: "#444",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#185fa5",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
};