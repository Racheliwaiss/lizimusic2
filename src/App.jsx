import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Collaboration from './pages/Collaboration';
import Search from './pages/Search';
import OpenStage from './pages/OpenStage';
import About from './pages/About';

function AppContent() {
  const { language } = useLanguage();

  useEffect(() => {
    // Set HTML direction for RTL support
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/collaboration" element={<Collaboration />} />
                <Route path="/search" element={<Search />} />
                <Route path="/open-stage" element={<OpenStage />} />
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
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
