
import React, { useState, useEffect } from 'react';
import { AppRole, User } from './types';
import { RoleSelector } from './components/RoleSelector';
import { AudienceView } from './components/AudienceView';
import { DJView } from './components/DJView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vibeline_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleRoleSelect = (role: AppRole) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: role === 'dj' ? 'DJ Master' : `Listener-${Math.floor(1000 + Math.random() * 9000)}`,
      role
    };
    setUser(newUser);
    localStorage.setItem('vibeline_user', JSON.stringify(newUser));
  };

  const handleExit = () => {
    setUser(null);
    localStorage.removeItem('vibeline_user');
  };

  if (!user) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen">
      {user.role === 'dj' ? (
        <DJView user={user} onExit={handleExit} />
      ) : (
        <AudienceView user={user} onExit={handleExit} />
      )}
    </div>
  );
};

export default App;
