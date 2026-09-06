/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import { SecurityTools } from './pages/SecurityTools';
import { DedicatedToolPage } from './pages/DedicatedToolPage';
import HackerLoader from './components/HackerLoader';
import { ModeProvider } from './context/ModeContext';

export default function App() {
  // Check if user has already experienced the boot sequence in this session
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('hn_boot_seen');
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hn_boot_seen', 'true');
    setIsLoading(false);
  };

  // Support replaying the intro via custom event (e.g. from footer or settings)
  useEffect(() => {
    const handleReplay = () => {
      setIsLoading(true);
    };
    window.addEventListener('replay-hacker-intro', handleReplay);
    return () => window.removeEventListener('replay-hacker-intro', handleReplay);
  }, []);

  return (
    <ModeProvider>
      <AnimatePresence mode="wait">
        {isLoading && (
          <HackerLoader onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<SecurityTools />} />
          <Route path="/tools/:id" element={<DedicatedToolPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Routes>
      </Router>
    </ModeProvider>
  );
}

