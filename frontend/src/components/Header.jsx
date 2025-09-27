import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <span className="icon">🦉</span>
        <div>
          <h1>Your Career Counselor</h1>
          <p className="tagline">Friendly career guidance & roadmaps</p>
        </div>
      </div>
    </header>
  );
}
