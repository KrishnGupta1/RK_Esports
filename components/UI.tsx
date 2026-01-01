
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({ 
  className = '', 
  variant = 'primary', 
  children,
  ...props 
}) => {
  const baseStyle = "w-full py-3.5 px-4 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group touch-manipulation z-10";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_4px_20px_rgba(255,46,77,0.3)] hover:shadow-[0_6px_25px_rgba(255,46,77,0.5)] border border-white/10",
    secondary: "bg-brand-800 hover:bg-brand-700 text-white border border-white/10",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-500/10 shadow-[0_0_10px_rgba(255,46,77,0.1)]",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props} 
    >
      {/* Shine effect overlay for primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none" />
      )}
      <span className="relative z-20 flex items-center gap-2">{children}</span>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <div className="relative group z-10">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple opacity-0 group-focus-within:opacity-50 transition duration-500 blur rounded-xl pointer-events-none"></div>
      <input 
        className={`relative w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:text-white transition-all font-display tracking-wide ${className}`}
        {...props} 
      />
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <div className="relative group z-10">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple opacity-0 group-focus-within:opacity-50 transition duration-500 blur rounded-xl pointer-events-none"></div>
      <textarea 
        className={`relative w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:text-white transition-all font-display tracking-wide min-h-[120px] resize-none ${className}`}
        {...props} 
      />
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`glass-panel rounded-2xl shadow-xl relative z-0 ${noPadding ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gold' | 'pink' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    red: "bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-[0_0_10px_rgba(255,46,77,0.1)]",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]",
    blue: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
    gold: "bg-yellow-600/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- MOBILE-FIRST MODAL SYSTEM ---

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, children, className = '' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 h-[100dvh] overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-[#0f0f11] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 relative shadow-2xl max-h-[90dvh] flex flex-col z-20 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle */}
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0 opacity-50"></div>
            
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ModalHeader: React.FC<{ title: string; onClose: () => void; icon?: React.ReactNode }> = ({ title, onClose, icon }) => (
  <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#141416]/50">
    <div className="flex items-center gap-3">
       {icon && (
          <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-500 border border-brand-500/20">
            {icon}
          </div>
       )}
       <h3 className="text-xl font-bold text-white font-display tracking-wide">{title}</h3>
    </div>
    <button 
       onClick={onClose}
       className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors active:bg-white/10 z-20"
    >
       <X size={20} />
    </button>
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-5 overflow-y-auto flex-1 custom-scrollbar relative z-10 ${className}`}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-5 border-t border-white/5 bg-[#141416] shrink-0 pb-[calc(2rem+env(safe-area-inset-bottom))] z-20 ${className}`}>
    {children}
  </div>
);
