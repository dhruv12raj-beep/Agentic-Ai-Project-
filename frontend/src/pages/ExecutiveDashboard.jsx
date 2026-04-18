import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const STATUS_COLORS = {
  open:        { bg: "#e6f1fb", text: "#185fa5" },
  in_progress: { bg: "#faeeda", text: "#854f0b" },
  resolved:    { bg: "#eaf3de", text: "#3b6d11" },
  escalated:   { bg: "#faece7", text: "#993c1d" },
};

const PRIORITY_COLORS = {
  high:   { bg: "#fcebeb", text: "#a32d2d" },
  medium: { bg: "#faeeda", text: "#854f0b" },
  low:    { bg: "#eaf3de", text: "#3b6d11" },
};

const STATUSES = ["open", "in_progress", "resolved", "escalated"];

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFiltered(tickets);
    } else {
      setFiltered(tickets.filter((t) => t.status === filter));
    }
  }, [filter, tickets]);

  async function fetchTickets() {
    try {
      const res = await API.get("/executive/tickets");
      setTickets(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(ticketId, status) {
    setUpdating(true);
    try {
      await API.patch(`/executive/tickets/${ticketId}/status?status=${status}`);
      toast.success(`Status updated to ${status}`);
      await fetchTickets();
      setSelected((prev) => prev ? { ...prev, status } : null);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>Executive Portal</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>Hi, {user.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { label: "Total tickets", value: stats.total, color: "#185fa5" },
            { label: "Open", value: stats.open, color: "#854f0b" },
            { label: "Escalated", value: stats.escalated, color: "#993c1d" },
            { label: "Resolved", value: stats.resolved, color: "#3b6d11" },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <span style={{ ...styles.statValue, color: s.color }}>
                {s.value}
              </span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {["all", ...STATUSES].map((f) => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                background: filter === f ? "#185fa5" : "#fff",
                color: filter === f ? "#fff" : "#444",
                borderColor: filter === f ? "#185fa5" : "#ddd",
              }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.empty}>Loading tickets...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No tickets found.</p>
        ) : (
          <div style={styles.layout}>
            {/* Ticket list */}
            <div style={styles.list}>
              {filtered.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    ...styles.ticketCard,
                    borderLeft: selected?.id === ticket.id
                      ? "3px solid #185fa5"
                      : "3px solid transparent",
                  }}
                  onClick={() => setSelected(ticket)}
                >
                  <div style={styles.ticketTop}>
                    <span style={styles.ticketSubject}>{ticket.subject}</span>
                    <span style={{
                      ...styles.badge,
                      background: STATUS_COLORS[ticket.status]?.bg || "#f5f5f5",
                      color: STATUS_COLORS[ticket.status]?.text || "#444",
                    }}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <p style={styles.ticketEmail}>{ticket.customer_email}</p>
                  <p style={styles.ticketDesc}>
                    {ticket.description.slice(0, 90)}
                    {ticket.description.length > 90 ? "..." : ""}
                  </p>
                  <div style={styles.ticketMeta}>
                    {ticket.priority && (
                      <span style={{
                        ...styles.priorityBadge,
                        background: PRIORITY_COLORS[ticket.priority]?.bg || "#f5f5f5",
                        color: PRIORITY_COLORS[ticket.priority]?.text || "#444",
                      }}>
                        {ticket.priority} priority
                      </span>
                    )}
                    {ticket.category && (
                      <span style={styles.category}>{ticket.category}</span>
                    )}
                    <span style={styles.date}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ticket detail panel */}
            {selected && (
              <div style={styles.detail}>
                <div style={styles.detailHeader}>
                  <h2 style={styles.detailTitle}>{selected.subject}</h2>
                  <button
                    style={styles.closeBtn}
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </button>
                </div>

                <div style={styles.detailSection}>
                  <p style={styles.detailLabel}>Customer</p>
                  <p style={styles.detailText}>{selected.customer_email}</p>
                </div>

                <div style={styles.detailSection}>
                  <p style={styles.detailLabel}>Description</p>
                  <p style={styles.detailText}>{selected.description}</p>
                </div>

                {selected.resolution_summary && (
                  <div style={{
                    ...styles.detailSection,
                    background: "#eaf3de",
                    borderRadius: "8px",
                    padding: "14px",
                  }}>
                    <p style={{ ...styles.detailLabel, color: "#3b6d11" }}>
                      AI Resolution
                    </p>
                    <p style={{ ...styles.detailText, color: "#27500a" }}>
                      {selected.resolution_summary}
                    </p>
                  </div>
                )}

                {selected.agent_reasoning && (
                  <div style={styles.detailSection}>
                    <p style={styles.detailLabel}>Agent reasoning</p>
                    <pre style={styles.reasoning}>
                      {JSON.stringify(
                        JSON.parse(selected.agent_reasoning), null, 2
                      )}
                    </pre>
                  </div>
                )}

                {selected.escalation_trail?.length > 0 && (
                  <div style={{
                    ...styles.detailSection,
                    background: "#faece7",
                    borderRadius: "8px",
                    padding: "14px",
                  }}>
                    <p style={{ ...styles.detailLabel, color: "#993c1d" }}>
                      Escalation trail
                    </p>
                    {selected.escalation_trail.map((e, i) => (
                      <p key={i} style={{ ...styles.detailText, color: "#712b13" }}>
                        Escalated to {e.escalated_to} — {e.reason}
                      </p>
                    ))}
                  </div>
                )}

                {selected.conversation_history?.length > 0 && (
                  <div style={styles.detailSection}>
                    <p style={styles.detailLabel}>Agent activity</p>
                    <div style={styles.timeline}>
                      {selected.conversation_history.map((entry, i) => (
                        <div key={i} style={styles.timelineEntry}>
                          <div style={styles.timelineDot} />
                          <p style={styles.timelineText}>{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status update */}
                <div style={styles.detailSection}>
                  <p style={styles.detailLabel}>Update status</p>
                  <div style={styles.statusBtns}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={updating || selected.status === s}
                        style={{
                          ...styles.statusBtn,
                          background: selected.status === s ? "#185fa5" : "#f5f5f5",
                          color: selected.status === s ? "#fff" : "#444",
                          opacity: updating ? 0.6 : 1,
                        }}
                        onClick={() => updateStatus(selected.id, s)}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f5" },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: { fontSize: "16px", fontWeight: "600", color: "#534ab7" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navUser: { fontSize: "14px", color: "#444" },
  logoutBtn: {
    padding: "7px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#f5f5f5",
    fontSize: "13px",
    cursor: "pointer",
    color: "#666",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px 24px",
    border: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: { fontSize: "28px", fontWeight: "600" },
  statLabel: { fontSize: "13px", color: "#888" },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "7px 16px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  empty: { textAlign: "center", color: "#666", marginTop: "60px" },
  layout: { display: "flex", gap: "20px", alignItems: "flex-start" },
  list: { flex: "1", display: "flex", flexDirection: "column", gap: "12px" },
  ticketCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px 20px",
    border: "1px solid #e5e5e5",
    cursor: "pointer",
  },
  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4px",
    gap: "12px",
  },
  ticketSubject: { fontSize: "15px", fontWeight: "500", color: "#1a1a1a" },
  ticketEmail: { fontSize: "12px", color: "#888", marginBottom: "6px" },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    flexShrink: 0,
    textTransform: "capitalize",
  },
  ticketDesc: {
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "10px",
  },
  ticketMeta: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  priorityBadge: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  category: {
    fontSize: "11px",
    color: "#888",
    background: "#f5f5f5",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "capitalize",
  },
  date: { fontSize: "11px", color: "#aaa", marginLeft: "auto" },
  detail: {
    width: "420px",
    flexShrink: 0,
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  detailTitle: { fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#888",
    flexShrink: 0,
  },
  detailSection: { display: "flex", flexDirection: "column", gap: "6px" },
  detailLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailText: { fontSize: "14px", color: "#333", lineHeight: "1.6" },
  reasoning: {
    fontSize: "11px",
    color: "#555",
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "12px",
    overflowX: "auto",
    lineHeight: "1.6",
  },
  timeline: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" },
  timelineEntry: { display: "flex", gap: "10px", alignItems: "flex-start" },
  timelineDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#534ab7",
    marginTop: "5px",
    flexShrink: 0,
  },
  timelineText: { fontSize: "13px", color: "#555", lineHeight: "1.5" },
  statusBtns: { display: "flex", gap: "8px", flexWrap: "wrap" },
  statusBtn: {
    padding: "7px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500",
    textTransform: "capitalize",
  },
};