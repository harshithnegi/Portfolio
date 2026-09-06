import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Play, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffensiveMode } from '../context/ModeContext';

interface ProjectCardProps {
  id?: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, title, category, image, tags }) => {
  const { mode } = useOffensiveMode();

  // Determine fallback id if not provided
  const targetId = id || (
    title.toLowerCase().includes('sql') ? 'sql-injection-lab' :
    title.toLowerCase().includes('jwt') ? 'jwt-analyzer-forge' :
    title.toLowerCase().includes('xss') ? 'xss-csp-playground' :
    title.toLowerCase().includes('syn') || title.toLowerCase().includes('port') ? 'syn-port-scanner' :
    title.toLowerCase().includes('arp') || title.toLowerCase().includes('mitm') ? 'mitm-arp-spoofer' :
    title.toLowerCase().includes('cidr') || title.toLowerCase().includes('subnet') ? 'cidr-subnet-threatmap' :
    title.toLowerCase().includes('linux') || title.toLowerCase().includes('priv') ? 'linux-privesc-suite' :
    title.toLowerCase().includes('buffer') || title.toLowerCase().includes('bof') ? 'bof-stack-visualizer' :
    'reverse-shell-matrix'
  );

  const accentColor = mode === 'web' 
    ? 'text-blue-400 group-hover:text-blue-300' 
    : mode === 'network' 
    ? 'text-[#ff2a55] group-hover:text-white drop-shadow-[0_0_6px_rgba(255,0,60,0.6)]' 
    : 'text-neon-green group-hover:text-neon-green';

  const categoryColor = mode === 'web'
    ? 'text-blue-400'
    : mode === 'network'
    ? 'text-[#ff2a55] drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]'
    : 'text-neon-cyan';

  const hoverBorder = mode === 'web'
    ? 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]'
    : mode === 'network'
    ? 'hover:border-[#ff003c]/70 hover:shadow-[0_0_30px_rgba(255,0,60,0.45)]'
    : 'hover:border-neon-green/40 hover:shadow-[0_0_20px_rgba(0,255,159,0.2)]';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`group relative overflow-hidden rounded-2xl glass border border-white/10 transition-all duration-300 flex flex-col justify-between ${hoverBorder}`}
    >
      <Link to={`/project/${targetId}`} className="block">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={image} 
            alt={title} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Live Interactive Lab Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-mono font-bold text-white shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Lab</span>
          </div>
        </div>

        <div className="p-6">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${categoryColor}`}>{category}</span>
          <h3 className="text-xl font-bold mt-1 mb-3 transition-colors text-white group-hover:text-white">{title}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-white/5 rounded-md text-gray-400 border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6 pt-0">
        <Link
          to={`/project/${targetId}`}
          className={`flex items-center justify-between text-xs font-mono font-bold px-4 py-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 border border-white/10 transition-all ${accentColor}`}
        >
          <span className="flex items-center gap-2">
            <Play size={13} className="fill-current" />
            Launch Interactive Tool
          </span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
