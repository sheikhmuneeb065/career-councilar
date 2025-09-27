import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

export default function ChatWindow({ userName, messages, onUpdateMessages }) {
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(text) {
    if (!text) return;
    const newMessages = [...messages, { from: 'user', text }];
    onUpdateMessages(newMessages);
    setTyping(true);

    setTimeout(() => {
      const botReply = [...newMessages, { from: 'bot', text: 'This is a rule-based reply.' }];
      onUpdateMessages(botReply);
      setTyping(false);
    }, 800);
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.from}`}>
            <div className="avatar">
              {m.from === 'bot' ? '🦉' : userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="label">
                {m.from === 'bot' ? 'Chatbot' : userName}
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
  const [text, setText] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
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
