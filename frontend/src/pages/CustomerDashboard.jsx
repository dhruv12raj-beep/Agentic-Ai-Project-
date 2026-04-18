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

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const res = await API.get("/tickets/my");
      setTickets(res.data);
    } catch {
      toast.error("Failed to load tickets");
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
          <span style={styles.navUser}>Hi, {user.name}</span>
          <button
            style={styles.raiseBtn}
            onClick={() => navigate("/raise-ticket")}
          >
            + New Ticket
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Tickets</h1>
          <p style={styles.subtitle}>
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {loading ? (
          <p style={styles.empty}>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No tickets yet</p>
            <p style={styles.emptyText}>
              Raise your first ticket and our AI agent will respond shortly.
            </p>
            <button
              style={styles.raiseBtn}
              onClick={() => navigate("/raise-ticket")}
            >
              Raise a ticket
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            <div style={styles.list}>
              {tickets.map((ticket) => (
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
                  <p style={styles.ticketDesc}>
                    {ticket.description.slice(0, 100)}
                    {ticket.description.length > 100 ? "..." : ""}
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

                {selected.status === "escalated" && (
                  <div style={{
                    ...styles.detailSection,
                    background: "#faece7",
                    borderRadius: "8px",
                    padding: "14px",
                  }}>
                    <p style={{ ...styles.detailLabel, color: "#993c1d" }}>
                      Escalated to executive team
                    </p>
                    <p style={{ ...styles.detailText, color: "#712b13" }}>
                      Your ticket has been assigned to our support team who will
                      reach out shortly.
                    </p>
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
  navBrand: { fontSize: "16px", fontWeight: "600", color: "#185fa5" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navUser: { fontSize: "14px", color: "#444" },
  raiseBtn: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#185fa5",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
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
  container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" },
  header: { marginBottom: "24px" },
  title: { fontSize: "22px", fontWeight: "600", color: "#1a1a1a" },
  subtitle: { fontSize: "14px", color: "#666", marginTop: "4px" },
  empty: { textAlign: "center", color: "#666", marginTop: "60px" },
  emptyBox: {
    textAlign: "center",
    background: "#fff",
    borderRadius: "16px",
    padding: "60px 40px",
    border: "1px solid #e5e5e5",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" },
  emptyText: { fontSize: "14px", color: "#666", marginBottom: "24px" },
  layout: { display: "flex", gap: "20px", alignItems: "flex-start" },
  list: { flex: "1", display: "flex", flexDirection: "column", gap: "12px" },
  ticketCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px 20px",
    border: "1px solid #e5e5e5",
    cursor: "pointer",
    transition: "box-shadow 0.15s",
  },
  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
    gap: "12px",
  },
  ticketSubject: { fontSize: "15px", fontWeight: "500", color: "#1a1a1a" },
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
    width: "380px",
    flexShrink: 0,
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
  detailLabel: { fontSize: "12px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" },
  detailText: { fontSize: "14px", color: "#333", lineHeight: "1.6" },
  timeline: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" },
  timelineEntry: { display: "flex", gap: "10px", alignItems: "flex-start" },
  timelineDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#185fa5",
    marginTop: "5px",
    flexShrink: 0,
  },
  timelineText: { fontSize: "13px", color: "#555", lineHeight: "1.5" },
};