import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { mockDB } from './data/mockDB';
import EntryScreen from './components/EntryScreen';
import MainDashboard from './components/MainDashboard';
import AdminDashboard from './components/AdminDashboard';

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = async (code) => {
    const senior = await mockDB.getSeniorByCode(code);
    if (senior) {
      setCurrentUser(senior);
      setIsLoggedIn(true);
    } else {
      // Fallback for custom/new codes if needed
      setCurrentUser({ id: 'temp-' + code, code, name: 'Guest Senior', department: 'AI & Data Science', batch_year: '2026' });
      setIsLoggedIn(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            !isLoggedIn ? (
              <EntryScreen key="entry" onLogin={handleLogin} />
            ) : (
              <MainDashboard key="main" user={currentUser} />
            )
          } />
          <Route path="/admin" element={<AdminDashboard key="admin" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
