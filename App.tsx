
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ExtensionSimulator from './components/ExtensionSimulator';
import { User, UserStatus } from './types';
import { generateRandomUsername } from './utils/helpers';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize user for the simulation
    const savedUser = localStorage.getItem('visionsave_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: generateRandomUsername(),
        status: UserStatus.FREE,
        downloadsToday: 0,
        lastDownloadDate: new Date().toISOString().split('T')[0],
        joinedAt: Date.now()
      };
      localStorage.setItem('visionsave_user', JSON.stringify(newUser));
      setCurrentUser(newUser);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
              <i className="fas fa-eye text-white"></i>
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">VisionSave</span>
          </div>
          <div className="flex space-x-6 text-sm font-medium">
            <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">Admin Panel</Link>
            <Link to="/simulator" className="text-gray-600 hover:text-green-600 transition-colors">Extension Demo</Link>
          </div>
        </nav>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/simulator" element={<ExtensionSimulator user={currentUser} setUser={setCurrentUser} />} />
          </Routes>
        </main>

        <footer className="bg-gray-100 py-6 border-t text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} VisionSave Technology. All rights reserved.
        </footer>
      </div>
    </Router>
  );
};

export default App;
