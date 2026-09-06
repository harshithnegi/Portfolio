import React from 'react';
import { useOffensiveMode, OffensiveMode } from '../context/ModeContext';
import { Shield, Globe, Terminal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const ModeSwitchButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, setMode } = useOffensiveMode();
  const navigate = useNavigate();
  const location = useLocation();

  const modes: { id: OffensiveMode; icon: React.FC<{ className?: string }>; title: string; ariaLabel: string }[] = [
    {
      id: 'default',
      icon: Shield,
      title: 'Default Mode (Offensive Specialist)',
      ariaLabel: 'Default Cybersecurity Mode',
    },
    {
      id: 'web',
      icon: Globe,
      title: 'Web VAPT Mode (Application Security)',
      ariaLabel: 'Web VAPT Mode',
    },
    {
      id: 'network',
      icon: Terminal,
      title: 'Host & Network Mode (Infrastructure Security)',
      ariaLabel: 'Host and Network Mode',
    },
  ];

  const handleSelectMode = (newMode: OffensiveMode) => {
    setMode(newMode);
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div 
        className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-lg transition-all duration-300"
        role="group"
        aria-label="Theme mode switcher"
      >
        {modes.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          
          let activeStyles = 'bg-neon-green/20 text-neon-green border-neon-green/60 shadow-[0_0_10px_rgba(0,255,159,0.35)]';
          if (item.id === 'web') {
            activeStyles = 'bg-blue-500/20 text-blue-400 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.35)]';
          } else if (item.id === 'network') {
            activeStyles = 'bg-[#ff003c]/25 text-[#ff2a55] border-[#ff003c] shadow-[0_0_15px_rgba(255,0,60,0.7)]';
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelectMode(item.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer ${
                isActive
                  ? activeStyles
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/10'
              }`}
              title={item.title}
              aria-label={item.ariaLabel}
              type="button"
            >
              <Icon className="w-4 h-4 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
