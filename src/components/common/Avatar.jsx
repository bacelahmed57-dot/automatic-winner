import React, { useState } from 'react';
import { User } from 'lucide-react';

export const Avatar = ({ src, alt = 'User avatar', size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-32 h-32 text-4xl',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isDefaultProfile =
    !src ||
    src.includes('default-profile.png') ||
    src.includes('default') ||
    hasError;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold overflow-hidden border border-slate-200/80 bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-xs ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {!isDefaultProfile ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="select-none tracking-tight">
          {alt && alt !== 'User avatar' ? getInitials(alt) : <User className="w-1/2 h-1/2" />}
        </span>
      )}
    </div>
  );
};
