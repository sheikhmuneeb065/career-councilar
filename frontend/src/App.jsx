import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProfileModal from './components/ProfileModal';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(JSON.parse(localStorage.getItem('profile') || '{}'));

  const [chats, setChats] = useState([{ title: "Welcome Chat", messages: [] }]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleProfileClose = () => {
    const p = JSON.parse(localStorage.getItem('profile') || '{}');
    setProfile(p);
    setProfileOpen(false);
  };

  const handleNewChat = () => {
    const newChat = { title: "New Chat", messages: [] };
    const newChats = [newChat, ...chats];
    setChats(newChats);
    setCurrentChatIndex(0);
  };

  const handleSelectChat = (index) => setCurrentChatIndex(index);

  const handleDeleteChat = (index) => {
    const newChats = chats.filter((_, i) => i !== index);
    setChats(newChats);
    if (newChats.length === 0) setCurrentChatIndex(0);
    else if (index === 0) setCurrentChatIndex(0);
    else setCurrentChatIndex(index - 1);
  };

  const handleClearChats = () => {
    setChats([]);
    setCurrentChatIndex(0);
  };

  const handleUpdateMessages = (messages) => {
    const newChats = [...chats];
    newChats[currentChatIndex].messages = messages;

    if (
      messages.length === 1 &&
      messages[0].from === "user"
    ) {
      newChats[currentChatIndex].title =
        messages[0].text.slice(0, 25) + (messages[0].text.length > 25 ? "..." : "");
    }
    setChats(newChats);
  };

  const handleSignOut = () => {
    localStorage.removeItem('profile');
    setProfile({});
    alert('Profile signed out successfully!');
  };

  return (
    <div className="app-container">
      <Sidebar
        onOpenProfile={() => setProfileOpen(true)}
        theme={theme}
        setTheme={setTheme}
        profile={profile}
        chats={chats}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onClearChat={handleClearChats}
        onSignOut={handleSignOut}
      />
      <div className="main-area">
        <Header />
        {chats.length > 0 ? (
          <ChatWindow
            userName={profile.name || 'Guest'}
            messages={chats[currentChatIndex].messages}
            onUpdateMessages={handleUpdateMessages}
          />
        ) : (
          <div className="empty-chat">No chats available. Start a new one!</div>
        )}
      </div>
      {profileOpen && <ProfileModal onClose={handleProfileClose} />}
    </div>
  );
}
