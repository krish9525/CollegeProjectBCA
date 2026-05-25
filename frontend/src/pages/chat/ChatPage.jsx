import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import { UserContext } from "../../context/UserContext";
import Chat from "../../components/chat/Chat";
import "../../components/chat/chat.css";

const ChatPage = () => {
  const { user } = useContext(UserContext);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await axios.get(`${server}/api/user/admin`, {
          headers: { token: localStorage.getItem("token") },
        });
        setAdmin(data.admin);
      } catch (err) {
        setError("Unable to load chat. Please try again later.");
        console.error(err);
      }
    };
    fetchAdmin();
  }, [user._id]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", fontSize: 18 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!admin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12, color: "var(--text-muted)" }}>
        <span style={{ fontSize: 28, animation: "spin 1s linear infinite" }}>⏳</span>
        Loading chat...
      </div>
    );
  }

  return (
    <div className="chat-page-wrapper">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
          <p>Chat with support</p>
        </div>
        <div className="contact-item active">
          <div className="contact-avatar">
            🎓
            <div className="online-dot" />
          </div>
          <div className="contact-info">
            <div className="contact-name">{admin.name || "Admin"}</div>
            <div className="contact-status">🟢 Online</div>
          </div>
        </div>
        <div style={{ padding: "20px 16px", marginTop: "auto" }}>
          <div style={{
            background: "rgba(138,75,175,0.08)",
            border: "1px solid rgba(138,75,175,0.15)",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}>
            💡 <strong>Tip:</strong> Use emoji button 😊 for quick reactions. Press <kbd>Enter</kbd> to send.
          </div>
        </div>
      </div>

      {/* Chat window */}
      <Chat receiverId={admin._id} receiverName={admin.name || "Admin"} />
    </div>
  );
};

export default ChatPage;
