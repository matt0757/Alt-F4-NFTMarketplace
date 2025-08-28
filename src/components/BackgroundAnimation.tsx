import React, { useState, useEffect } from 'react';

// Helper function to get random blockchain colors
const getRandomBlockchainColor = () => {
  const colors = [
    'bg-blue-400', // Ethereum-like
    'bg-cyan-400', // Bitcoin-like
    'bg-purple-400', // Polygon-like
    'bg-green-400', // Algorand-like
    'bg-orange-400', // Sui-like
    'bg-yellow-400', // Binance-like
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate a particle with animation stage based on its initial position
const generateParticle = (id: string, type: string, index: number) => {
  // Calculate animation progress based on position (0-100%)
  const progress = Math.random();
  
  // Size based on particle type
  const size = type === 'normal' 
    ? 1 + Math.random() * 2 
    : type === 'block' 
      ? 3 + Math.random() * 4 
      : 6 + Math.random() * 5;
  
  // Duration based on particle type
  const duration = type === 'normal' 
    ? 10 + Math.random() * 30 
    : type === 'block' 
      ? 20 + Math.random() * 40 
      : 30 + Math.random() * 30;
  
  // Set initial positions based on animation progress to avoid "popping" effect
  // This creates an illusion that particles are already mid-animation
  const progressPoints = [
    { x: 0, y: 100 },             // 0% - bottom left
    { x: 25, y: 50 },             // 25% - middle left
    { x: 50, y: 0 },              // 50% - top middle
    { x: 75, y: -50 },            // 75% - middle right
    { x: 100, y: -100 }           // 100% - top right
  ];
  
  // Find position in animation timeline
  const startIndex = Math.floor(progress * 4);
  const nextIndex = (startIndex + 1) % 5;
  const pointProgress = (progress * 4) % 1;
  
  // Interpolate between points
  const left = progressPoints[startIndex].x + 
    (progressPoints[nextIndex].x - progressPoints[startIndex].x) * pointProgress;
    
  const top = progressPoints[startIndex].y + 
    (progressPoints[nextIndex].y - progressPoints[startIndex].y) * pointProgress;
  
  return {
    id: `${type}-${id}`,
    type,
    size,
    // Position based on animation progress
    left: left + Math.random() * 10 - 5, // Add slight randomness
    top: top + Math.random() * 10 - 5,   // Add slight randomness
    color: getRandomBlockchainColor(),
    duration,
    // No delay for initial particles to avoid the "popping" effect
    delay: 0,
    // Set animation delay to create the illusion of continuous animation
    animationDelay: `-${progress * duration}s`,
    opacity: type === 'normal' 
      ? 0.3 + Math.random() * 0.4 
      : type === 'block' 
        ? 0.4 + Math.random() * 0.3 
        : 0.3 + Math.random() * 0.2,
  };
};

const BackgroundAnimation: React.FC = () => {
  const [particles, setParticles] = useState<any[]>([]);
  
  // Generate particles on component mount
  useEffect(() => {
    // Normal particles (small dots)
    const normalParticles = [...Array(40)].map((_, i) => 
      generateParticle(i.toString(), 'normal', i)
    );

    // Block particles (slightly larger, hexagonal)
    const blockParticles = [...Array(10)].map((_, i) => 
      generateParticle(i.toString(), 'block', i)
    );

    // Node particles (largest, with pulsing effect)
    const nodeParticles = [...Array(5)].map((_, i) => 
      generateParticle(i.toString(), 'node', i)
    );

    setParticles([...normalParticles, ...blockParticles, ...nodeParticles]);
  }, []);

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
      
      {/* Floating Particles - Enhanced Blockchain Style */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${particle.color} animate-float`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: particle.animationDelay,
              borderRadius: particle.type === 'block' ? '20%' : 'full',
              boxShadow: particle.type === 'node' ? `0 0 10px ${particle.color.replace('bg-', 'text-')}` : 'none',
            }}
          />
        ))}
      </div>
      
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Only render connection lines if particles are loaded to avoid sudden appearance */}
        {particles.length > 0 && [...Array(15)].map((_, i) => {
          // Generate connection lines between approximate particle positions
          const sourceIndex = Math.floor(Math.random() * particles.length);
          const targetIndex = Math.floor(Math.random() * particles.length);
          
          // Prevent connecting a node to itself
          if (sourceIndex === targetIndex) return null;
          
          const source = particles[sourceIndex];
          const target = particles[targetIndex];
          
          return (
            <line 
              key={`line-${i}`} 
              x1={`${source.left}%`} 
              y1={`${source.top}%`} 
              x2={`${target.left}%`} 
              y2={`${target.top}%`} 
              stroke="url(#lineGradient)" 
              strokeWidth="0.5"
              strokeDasharray="3,3"
              className="animate-pulse"
              style={{ animationDuration: `${5 + Math.random() * 10}s` }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default BackgroundAnimation;
