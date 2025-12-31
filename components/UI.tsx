import React from 'react';
import { motion } from 'framer-motion';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({ 
  className = '', 
  variant = 'primary', 
  children,
  ...props 
}) => {
  const baseStyle = "w-full py-3 px-4 rounded-xl font-display font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_0_20px_rgba(255,46,77,0.3)] hover:shadow-[0_0_30px_rgba(255,46,77,0.5)] border border-white/10",
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
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      )}
      <span className="relative z-20 flex items-center gap-2">{children}</span>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple opacity-0 group-focus-within:opacity-50 transition duration-500 blur rounded-xl"></div>
      <input 
        className={`relative w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:text-white transition-all font-display tracking-wide ${className}`}
        {...props} 
      />
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple opacity-0 group-focus-within:opacity-50 transition duration-500 blur rounded-xl"></div>
      <textarea 
        className={`relative w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:text-white transition-all font-display tracking-wide min-h-[120px] resize-none ${className}`}
        {...props} 
      />
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`glass-panel rounded-2xl shadow-xl ${noPadding ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    red: "bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-[0_0_10px_rgba(255,46,77,0.1)]",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]",
    blue: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${colors[color]}`}>
      {children}
    </span>
  );
};