
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Episodes from './pages/Episodes';
import BusinessProfile from './pages/BusinessProfile';
import Blog from './pages/Blog';
import Commercial from './pages/Commercial';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';

import LocalGuide from './pages/LocalGuide';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans selection:bg-yellow-200">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/episodios" element={<Episodes />} />
            <Route path="/guia" element={<LocalGuide />} />
            <Route path="/negocio/:id" element={<BusinessProfile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/comercial" element={<Commercial />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/termos" element={<TermsOfUse />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </AuthProvider>
  );
};

export default App;
