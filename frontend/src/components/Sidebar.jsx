import React, { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({
  onOpenProfile,
  theme,
  setTheme,
  profile,
  chats,
  onSelectChat,
  onNewChat,
  onClearChat,
  onDeleteChat,
  onSignOut,
}) {
  const [isOpen, setIsOpen] = useState(false); // sidebar toggle
  const userName = profile.name || "Guest";
  const userEducation = profile.education || "No profile set";

  return (
    <>
      {/* Hamburger Button */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Profile Section */}
        <div className="profile-section">
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{userName}</strong>
            <div className="muted">{userEducation}</div>
          </div>
        </div>

        {/* Profile & Chat Controls */}
        <button className="btn" onClick={onOpenProfile}>
          + Add Profile
        </button>
        <button className="btn" onClick={onNewChat}>
          + New Chat
        </button>

        {/* Chat History */}
        <div className="chat-history">
          <h4>History</h4>
          {chats.length === 0 ? (
            <p className="muted">No chats yet</p>
          ) : (
            <ul>
              {chats.map((chat, idx) => (
                <li key={idx} className="chat-item">
                  <span onClick={() => onSelectChat(idx)}>
                    {chat.title || `Chat ${idx + 1}`}
                  </span>
                  <button
                    className="delete-chat"
                    onClick={() => onDeleteChat(idx)}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clear All Chats */}
        {chats.length > 0 && (
          <button className="clear-btn btn" onClick={onClearChat}>
            🗑 Clear All Chats
          </button>
        )}

        {/* Theme Switch */}
        <div className="theme-switch">
          <label>Theme: </label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Sign Out */}
        <button className="signout-btn btn" onClick={onSignOut}>
          Sign Out
        </button>
      </aside>
    </>
  );
}
