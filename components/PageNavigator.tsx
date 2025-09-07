import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({ currentPage, totalPages, onPageChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeX = clientX - trackRect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / trackRect.width));
    const newPage = Math.round(percentage * (totalPages - 1));
    if (newPage !== currentPage) {
      onPageChange(newPage);
    }
  }, [totalPages, currentPage, onPageChange]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientX);
  };

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) handleInteraction(e.clientX);
  }, [isDragging, handleInteraction]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) handleInteraction(e.touches[0].clientX);
  }, [isDragging, handleInteraction]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const progressPercentage = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;

  return (
    <div className="w-full py-2 cursor-pointer" ref={trackRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      <div className="relative h-1 bg-gray-300 dark:bg-gray-700 rounded-full">
        <div className="absolute top-0 left-0 h-full bg-black dark:bg-white rounded-full" style={{ width: `${progressPercentage}%` }} />
        <div
          ref={handleRef}
          className="absolute top-1/2 w-4 h-4 bg-black dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default PageNavigator;