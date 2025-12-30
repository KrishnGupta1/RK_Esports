import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  className = '', 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyle = "w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_15px_rgba(255,71,87,0.4)]",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-500/10"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props} 
    />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-brand-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors ${className}`}
      {...props} 
    />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-800 border border-gray-700 rounded-xl p-4 shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-green-500/20 text-green-400 border-green-500/50",
    red: "bg-red-500/20 text-red-400 border-red-500/50",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};