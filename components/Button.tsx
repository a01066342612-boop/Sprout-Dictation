import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-cute rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900",
    secondary: "bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-200",
    danger: "bg-red-400 hover:bg-red-500 text-white",
    success: "bg-green-400 hover:bg-green-500 text-white"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
