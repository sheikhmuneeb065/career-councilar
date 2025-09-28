import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";

export default function ChatWindow({ userName, messages, onUpdateMessages }) {
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    if (!text) return;

    const newMessages = [...messages, { from: "user", text }];
    onUpdateMessages(newMessages);
    setTyping(true);

    try {
      const resp = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userName || "Guest",
          message: text,
        }),
      });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const data = await resp.json();

  // backend historically returned `response`; older/other builds might return `reply`.
  // Be tolerant and accept either field so UI doesn't fall back unnecessarily.
  const replyText = data.response ?? data.reply ?? "No response";
  const botReply = [...newMessages, { from: "bot", text: replyText }];
      onUpdateMessages(botReply);
    } catch (err) {
      console.warn("Backend call failed, falling back:", err);
      const botReply = [
        ...newMessages,
        { from: "bot", text: "This is a fallback reply." },
      ];
      onUpdateMessages(botReply);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.from}`}>
            <div className="avatar">
              {m.from === "bot" ? "🦉" : (userName?.charAt(0).toUpperCase() || "?")}
            </div>
            <div>
              <div className="label">
                {m.from === "bot" ? "Chatbot" : (userName || "Guest")}
              </div>
              <div className="bubble">{m.text}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg-row bot">
            <div className="avatar">🦉</div>
            <div>
              <div className="label">Chatbot</div>
              <div className="bubble">...</div>
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}

function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form className="composer" onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}
