import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { mockDB } from './data/mockDB';
import EntryScreen from './components/EntryScreen';
import MainDashboard from './components/MainDashboard';
import AdminDashboard from './components/AdminDashboard';

const ADMIN_ACCESS_KEY = 'admin_access_granted';

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_ACCESS_KEY) === '1'
  );

  const unlockAdmin = () => {
    sessionStorage.setItem(ADMIN_ACCESS_KEY, '1');
    setIsAdminUnlocked(true);
  };

  const lockAdmin = () => {
    sessionStorage.removeItem(ADMIN_ACCESS_KEY);
    setIsAdminUnlocked(false);
  };

  const handleLogin = async (code) => {
    const senior = await mockDB.getSeniorByCode(code);
    if (senior) {
      setCurrentUser(senior);
      setIsLoggedIn(true);
      return true;
    } else {
      return false;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            !isLoggedIn ? (
              <EntryScreen key="entry" onLogin={handleLogin} onAdminUnlock={unlockAdmin} />
            ) : (
              <MainDashboard key="main" user={currentUser} />
            )
          } />
          <Route
            path="/admin"
            element={isAdminUnlocked ? <AdminDashboard key="admin" onAdminLogout={lockAdmin} /> : <Navigate to="/" replace />}
          />
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
