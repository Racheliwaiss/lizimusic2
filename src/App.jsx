import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { AuthProvider, useAuth } from './AuthContext';
import { GeoProvider } from './GeoContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Collaboration from './pages/Collaboration';
import ProjectDetail from './pages/ProjectDetail';
import Search from './pages/Search';
import OpenStage from './pages/OpenStage';
import About from './pages/About';
import Memorial from './pages/Memorial';
import Feed from './pages/Feed';
import Events from './pages/Events';
import FindBandmate from './pages/FindBandmate';
import Contact from './pages/Contact';
import MyTracks from './pages/MyTracks';
import BandBackground from './components/BandBackground';

// Protected Route Component
function ProtectedRoute({ element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function AppContent() {
  const { language } = useLanguage();

  useEffect(() => {
    // Set HTML direction for RTL support
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/memorial" element={<Memorial />} />
                <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="/dashboard" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
                <Route path="/my-tracks" element={<ProtectedRoute element={<MyTracks />} />} />
                <Route path="/collaboration" element={<Collaboration />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/open-stage" element={<OpenStage />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/events" element={<Events />} />
                <Route path="/find-bandmate" element={<FindBandmate />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GeoProvider>
          <BandBackground />
          <AppContent />
        </GeoProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
