import React from 'react';
import './Sidebar.css';

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
  onSignOut
}) {
  const userName = profile.name || "Guest";
  const userEducation = profile.education || "No profile set";

  return (
    <aside className="sidebar">

      <div className="profile-section">
        <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{userName}</strong>
          <div className="muted">{userEducation}</div>
        </div>
      </div>

      <button className='btn' onClick={onOpenProfile}>  + Add  Profile</button>

      <button className='btn' onClick={onNewChat}>+ New Chat</button>

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

      {chats.length > 0 && (
        <button  className="clear-btn btn" onClick={onClearChat}>
          🗑 Clear All Chats
        </button>
      )}

      <div className="theme-switch">
        <label>Theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <button className="signout-btn btn" onClick={onSignOut}>
        Sign Out
      </button>
    </aside>
  );
}
