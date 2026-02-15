import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import StatusDashboard from './pages/StatusDashboard';
import DesignSystemPreview from './pages/DesignSystemPreview';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/management" element={<Management />} />
          <Route path="/status" element={<StatusDashboard />} />
          <Route path="/design-system" element={<DesignSystemPreview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;
