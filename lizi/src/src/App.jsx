import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/globals.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LandingPage  from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage  from './pages/ProfilePage';
import CollabPage   from './pages/CollabPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<LandingPage  />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/profile"  element={<ProfilePage  />} />
        <Route path="/collab"   element={<CollabPage   />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
