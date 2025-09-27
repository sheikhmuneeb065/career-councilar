import React, { useState } from 'react';
import './ProfileModal.css';

export default function ProfileModal({ onClose }) {
  const [profile, setProfile] = useState({ name: '', education: '', interests: '' });

  function save() {
    localStorage.setItem('profile', JSON.stringify(profile));
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Set your profile</h3>
        <label>Name
          <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
        </label>
        <label>Education
          <input value={profile.education} onChange={e => setProfile({ ...profile, education: e.target.value })} />
        </label>
        <label>Interests
          <input value={profile.interests} onChange={e => setProfile({ ...profile, interests: e.target.value })} />
        </label>
        <div className="actions">
          <button onClick={save}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
