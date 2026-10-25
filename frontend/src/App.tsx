import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleBanner } from './components/layout/RoleBanner';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { PrintStudioPage } from './pages/PrintStudioPage';
import { KioskLocatorPage } from './pages/KioskLocatorPage';
import { PickupCalendarPage } from './pages/PickupCalendarPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WalletPage } from './pages/WalletPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { KioskOperatorPage } from './pages/KioskOperatorPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Public standalone pages without app shell
  const isPublic = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <RoleBanner />
      <div className="flex-1 flex">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Navbar onToggleSidebar={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/print-studio" element={<PrintStudioPage />} />
            <Route path="/kiosks" element={<KioskLocatorPage />} />
            <Route path="/calendar" element={<PickupCalendarPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/orders/:trackingCode" element={<OrderDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<HelpSupportPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/operator" element={<KioskOperatorPage />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
