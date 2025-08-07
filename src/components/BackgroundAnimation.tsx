import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Animated Orbs with Blockchain Colors */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse animation-delay-4000" />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-50 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundAnimation;
