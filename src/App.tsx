import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Anniversary from './pages/Anniversary';
import Hobbies from './pages/Hobbies';
import Profile from './pages/Profile';
import Pair from './pages/Pair';
import Album from './pages/Album';
import NotFound from './pages/NotFound';
import { ClickEffects } from './components/ui/ClickEffects';

import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { initFileSystem } from './utils/fileSystem';

const buildSyncSignature = (state: ReturnType<typeof useAppStore.getState>) => JSON.stringify({
  timelineEvents: state.timelineEvents,
  anniversaries: state.anniversaries,
  hobbies: state.hobbies,
  calendarNotes: state.calendarNotes,
  dayStatuses: state.dayStatuses,
  photos: state.photos,
  startDate: state.startDate,
  themeColor: state.themeColor,
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const spaceCode = useAuthStore((state) => state.spaceCode);
  const syncFromCloud = useAppStore((state) => state.syncFromCloud);
  const syncToCloud = useAppStore((state) => state.syncToCloud);
  const refreshPartnerFromCloud = useAuthStore((state) => state.refreshPartnerFromCloud);
  const [cloudReady, setCloudReady] = useState(false);
  const lastSyncedSignatureRef = useRef<string | null>(null);

  const syncSignature = useAppStore((state) => buildSyncSignature(state));

  useEffect(() => {
    // Initialize file system folders on app launch
    initFileSystem();
  }, []);

  useEffect(() => {
    // iOS WebView occasionally loses a single flag; recover auth if core identity still exists.
    const state = useAuthStore.getState();
    if (!state.isAuthenticated && state.user && state.spaceCode) {
      useAuthStore.setState({ isAuthenticated: true });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !spaceCode) {
      setCloudReady(false);
      return;
    }

    let cancelled = false;
    const bootstrapCloudData = async () => {
      setCloudReady(false);
      try {
        // Pull once on open, then mark current state as baseline to avoid immediate push-back.
        await syncFromCloud();
        await refreshPartnerFromCloud();
      } catch (e) {
        console.error('Cloud bootstrap failed:', e);
      } finally {
        if (!cancelled) {
          const latestSignature = buildSyncSignature(useAppStore.getState());
          lastSyncedSignatureRef.current = latestSignature;
          setCloudReady(true);
        }
      }
    };

    void bootstrapCloudData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, spaceCode, syncFromCloud, refreshPartnerFromCloud]);

  useEffect(() => {
    if (!isAuthenticated || !spaceCode || !cloudReady) return;
    if (lastSyncedSignatureRef.current === syncSignature) return;

    const timer = setTimeout(async () => {
      try {
        await syncToCloud();
        lastSyncedSignatureRef.current = syncSignature;
      } catch (e) {
        console.error('Auto sync to cloud failed:', e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, spaceCode, cloudReady, syncSignature, syncToCloud]);

  return (
    <BrowserRouter>
      <ClickEffects />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/album" element={<Album />} />
          <Route path="/anniversary" element={<Anniversary />} />
          <Route path="/hobbies" element={<Hobbies />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pair" element={<Pair />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
