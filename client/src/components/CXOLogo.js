import React from 'react';

const CXOLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { container: 'h-8', text: 'text-lg' },
    md: { container: 'h-10', text: 'text-xl' },
    lg: { container: 'h-12', text: 'text-2xl' },
    xl: { container: 'h-16', text: 'text-3xl' }
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* CXO Logo SVG */}
      <div className={`${sizeClasses.container} flex items-center`}>
        <svg viewBox="0 0 200 80" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
          {/* C Letter - Metallic Gray */}
          <defs>
            <linearGradient id="cGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9CA3AF', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#6B7280', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* X Letter - Metallic Silver */}
            <linearGradient id="xGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#D1D5DB', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#9CA3AF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#6B7280', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* O Circle - Blue Glow */}
            <radialGradient id="oGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
            </radialGradient>
            
            {/* Bars inside O */}
            <linearGradient id="barsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* C Letter */}
          <path 
            d="M 45 15 A 25 25 0 0 0 45 65 L 50 60 A 18 18 0 0 1 50 20 Z" 
            fill="url(#cGradient)" 
            stroke="#374151" 
            strokeWidth="1.5"
          />
          <path 
            d="M 15 40 A 25 25 0 0 1 45 15 L 50 20 A 18 18 0 0 0 22 40 Z" 
            fill="url(#cGradient)" 
            stroke="#374151" 
            strokeWidth="1.5"
          />
          
          {/* X Letter */}
          <path 
            d="M 70 15 L 95 40 L 70 65 L 75 65 L 100 40 L 75 15 Z" 
            fill="url(#xGradient)" 
            stroke="#4B5563" 
            strokeWidth="1.5"
          />
          <path 
            d="M 100 15 L 75 40 L 100 65 L 105 65 L 80 40 L 105 15 Z" 
            fill="url(#xGradient)" 
            stroke="#4B5563" 
            strokeWidth="1.5"
          />
          
          {/* O Circle with Blue Glow */}
          <circle 
            cx="155" 
            cy="40" 
            r="28" 
            fill="url(#oGradient)" 
            stroke="#1E40AF" 
            strokeWidth="2"
          />
          <circle 
            cx="155" 
            cy="40" 
            r="22" 
            fill="none" 
            stroke="#60A5FA" 
            strokeWidth="1" 
            opacity="0.5"
          />
          
          {/* Analytics Bars inside O */}
          <rect x="145" y="50" width="4" height="10" fill="url(#barsGradient)" rx="1" />
          <rect x="151" y="45" width="4" height="15" fill="url(#barsGradient)" rx="1" />
          <rect x="157" y="35" width="4" height="25" fill="url(#barsGradient)" rx="1" />
          <rect x="163" y="40" width="4" height="20" fill="url(#barsGradient)" rx="1" />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div>
          <h1 className={`${sizeClasses.text} font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent`}>
            CXO Survey
          </h1>
        </div>
      )}
    </div>
  );
};

export default CXOLogo;
