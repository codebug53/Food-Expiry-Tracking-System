import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Result from './pages/Result';
import History from './pages/History';

function Navbar() {
  return (
    <nav className="fixed w-full h-20 bg-white/90 backdrop-blur-md z-50 border-b border-charcoal/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="text-3xl font-heading font-black tracking-normal uppercase text-charcoal flex items-baseline">
          MODERN PANTRY<span className="text-golden font-sans leading-none">.</span>
        </Link>
        
        {/* CENTER NAV */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="#features" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">Features</Link>
          <Link to="#how-it-works" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">How it Works</Link>
          <Link to="/scan" className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors">Demo App</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">
          {/* Link to="/login" removed to just allow the demo app */}
          <Link to="/scan" className="text-sm font-medium bg-charcoal text-white px-6 py-2.5 rounded-full hover:bg-darkGray transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-charcoal bg-white selection:bg-golden/30">
        <Navbar />
        {/* We use pt-20 to offset the fixed h-20 navbar */}
        <main className="flex-1 w-full pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<div className="container mx-auto px-4 py-8"><Scan /></div>} />
            <Route path="/result" element={<div className="container mx-auto px-4 py-8"><Result /></div>} />
            <Route path="/history" element={<div className="container mx-auto px-4 py-8"><History /></div>} />
          </Routes>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

export default App;
