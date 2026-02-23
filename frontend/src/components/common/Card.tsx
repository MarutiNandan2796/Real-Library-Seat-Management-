import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
