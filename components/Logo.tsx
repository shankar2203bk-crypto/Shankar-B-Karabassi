import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d65a45" />
        <stop offset="100%" stopColor="#b0402e" />
      </linearGradient>
    </defs>
    
    {/* Badge Background */}
    <rect x="10" y="10" width="180" height="180" rx="45" fill="url(#rustGradient)" />
    <rect x="25" y="25" width="150" height="150" rx="35" fill="none" stroke="#7c2d12" strokeWidth="2" opacity="0.3" />
    
    {/* Robot Head */}
    <g transform="translate(50, 40)">
      {/* Neck */}
      <rect x="42" y="90" width="16" height="10" fill="#334155" />
      
      {/* Head Chassis */}
      <rect x="10" y="20" width="80" height="70" rx="20" fill="#1e293b" stroke="#f1f5f9" strokeWidth="3" />
      
      {/* Face Screen */}
      <rect x="20" y="35" width="60" height="30" rx="10" fill="#ffedd5" />
      
      {/* Eyes */}
      <circle cx="38" cy="50" r="7" fill="#1e293b" />
      <circle cx="62" cy="50" r="7" fill="#1e293b" />
      
      {/* Antenna */}
      <line x1="50" y1="20" x2="50" y2="5" stroke="#f1f5f9" strokeWidth="3" />
      <circle cx="50" y="2" r="6" fill="#f1f5f9" />
      
      {/* Ears */}
      <path d="M10 40 L0 45 L10 50 Z" fill="#334155" />
      <path d="M90 40 L100 45 L90 50 Z" fill="#334155" />
    </g>
    
    {/* Text */}
    <path id="curve" d="M 30 150 Q 100 170 170 150" fill="transparent" />
    <text width="200" textAnchor="middle" x="100" y="145" fontFamily="sans-serif" fontWeight="800" fontSize="22" fill="#ffedd5" letterSpacing="1.5" style={{textShadow: '1px 1px 0px #7c2d12'}}>
      FORGE
    </text>
    <text width="200" textAnchor="middle" x="100" y="172" fontFamily="sans-serif" fontWeight="900" fontSize="24" fill="#1e293b" letterSpacing="3">
      IQ
    </text>
  </svg>
);

export default Logo;