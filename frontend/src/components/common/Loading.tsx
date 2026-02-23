import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8 min-h-screen">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-75"></div>
        
        {/* Middle ring */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
        </div>
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl animate-bounce-slow">
            📚
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute mt-32">
        <p className="text-gray-600 font-bold text-lg animate-pulse">Loading...</p>
        <div className="flex gap-1 justify-center mt-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
