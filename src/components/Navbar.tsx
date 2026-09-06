import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ModeSwitchButton } from './ModeSwitchButton';
import { useOffensiveMode } from '../context/ModeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useOffensiveMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Projects', href: '/portfolio' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.dispatchEvent(new CustomEvent('replay-hacker-intro'));
  };

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.split('#')[1];
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Dynamic accent text according to active mode
  const accentText = mode === 'web' 
    ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.85)]' 
    : mode === 'network' 
    ? 'text-[#ff2a55] drop-shadow-[0_0_12px_rgba(255,0,60,0.9)]' 
    : 'text-neon-green drop-shadow-[0_0_8px_rgba(0,255,159,0.7)]';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center gap-4">
        {/* Brand Logo */}
        <a 
          href="/" 
          onClick={handleBrandClick} 
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="Harshit Negi - Ethical Hacker"
        >
          <Shield className={`w-8 h-8 group-hover:scale-105 transition-all duration-300 ${accentText}`} />
          <span className="text-2xl font-display font-bold tracking-tighter group-hover:text-white transition-colors">
            HARSHIT <span className={`transition-colors duration-500 ${accentText}`}>NEGI</span>
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('/#') ? (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const id = link.href.split('#')[1];
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {link.name}
              </Link>
            )
          ))}

          {/* Sleek Mode Switch Button */}
          <ModeSwitchButton />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <ModeSwitchButton />
          <button 
            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass p-6 md:hidden flex flex-col gap-4 shadow-2xl"
          >
            {navLinks.map((link) => (
              link.href.startsWith('/#') ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-medium text-gray-200 hover:text-white py-1"
                  onClick={(e) => {
                    handleLinkClick(link.href);
                    if (location.pathname === '/') {
                      e.preventDefault();
                    }
                  }}
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-lg font-medium text-gray-200 hover:text-white py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
