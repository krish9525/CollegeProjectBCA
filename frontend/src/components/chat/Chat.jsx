import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../../context/UserContext';
import io from 'socket.io-client';
import axios from 'axios';
import { server } from '../../main';
import './chat.css';

const EMOJIS = ['😊','😂','👍','❤️','🔥','🎉','😎','🤔','👏','💯','✅','🙏','😅','😍','🚀','💪','😢','😮','🤣','👀'];

const Chat = ({ receiverId, receiverName = 'Admin' }) => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmoji, setShowEmoji] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const typingTimeoutRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!user?._id) return;
    socketRef.current = io(server);
    socketRef.current.emit('join', user._id);
    return () => socketRef.current.disconnect();
  }, [user?._id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${server}/api/chat/${receiverId}`, {
          headers: { token: localStorage.getItem('token') }
        });
        setMessages(data.messages);
      } catch (error) {
        console.error(error);
      }
    };
    if (receiverId) fetchHistory();
  }, [receiverId]);

  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    socketRef.current.on('typing', (data) => {
      setTypingUsers(prev => new Set(prev).add(data.sender));
    });
    socketRef.current.on('stopTyping', (data) => {
      setTypingUsers(prev => { const s = new Set(prev); s.delete(data.sender); return s; });
    });
    return () => {
      socketRef.current.off('receiveMessage');
      socketRef.current.off('typing');
      socketRef.current.off('stopTyping');
    };
  }, [socketRef.current]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const messageData = {
      sender: user._id,
      receiver: receiverId,
      message: newMessage.trim(),
    };
    socketRef.current.emit('sendMessage', messageData);
    setMessages(prev => [...prev, { ...messageData, createdAt: new Date() }]);
    setNewMessage('');
    socketRef.current.emit('stopTyping', { sender: user._id, receiver: receiverId });
    setShowEmoji(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { sender: user._id, receiver: receiverId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stopTyping', { sender: user._id, receiver: receiverId });
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => {
    const date = new Date(d), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const grouped = messages.reduce((g, m) => {
    const k = new Date(m.createdAt).toDateString();
    if (!g[k]) g[k] = [];
    g[k].push(m);
    return g;
  }, {});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">🎓</div>
        <div className="chat-header-info">
          <h3>{receiverName}</h3>
          <span className="header-status">🟢 Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages" onClick={() => setShowEmoji(false)}>
        {messages.length === 0 && (
          <div className="no-messages">
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <p>Say hello to {receiverName}!</p>
          </div>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} className="date-group">
            <div className="date-header">{formatDate(date)}</div>
            {msgs.map((msg, i) => (
              <div key={i} className={`message ${msg.sender === user._id ? 'sent' : 'received'}`}>
                <p>{msg.message}</p>
                <span>{formatTime(msg.createdAt)}</span>
              </div>
            ))}
          </div>
        ))}

        {typingUsers.has(receiverId) && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="emoji-picker">
          {EMOJIS.map((e) => (
            <button key={e} className="emoji-item" onClick={() => addEmoji(e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-container">
        <button
          className="emoji-btn"
          onClick={(e) => { e.stopPropagation(); setShowEmoji(p => !p); }}
          title="Emoji"
        >
          😊
        </button>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button className="send-btn" onClick={sendMessage} title="Send">
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;
