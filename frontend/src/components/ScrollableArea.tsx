import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { debounce } from 'lodash';

interface ScrollableAreaProps {
  children: React.ReactNode;
  offset?: number; // extra bottom buffer in px
  debounceTime?: number; // debounce delay in ms
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_DEBOUNCE = 100;

const ScrollableArea: React.FC<ScrollableAreaProps> = ({
  children,
  offset = 0,
  debounceTime = DEFAULT_DEBOUNCE,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);

  // Calculate available height for the element
  const calculateHeight = React.useCallback(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const { top } = containerRef.current.getBoundingClientRect();
    const available = window.innerHeight - top - offset;
    setMaxHeight(`${available > 0 ? available : 0}px`);
  }, [offset]);

  useLayoutEffect(() => {
    // Initial measurement on mount
    calculateHeight();
  }, [calculateHeight]);

  useEffect(() => {
    // Debounced resize handler
    const handleResize = debounce(calculateHeight, debounceTime);
    window.addEventListener('resize', handleResize);

    // Observe parent size changes
    let ro: ResizeObserver | null = null;
    if (containerRef.current?.parentElement) {
      ro = new ResizeObserver(handleResize);
      ro.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
      if (ro) {
        ro.disconnect();
      }
    };
  }, [calculateHeight, debounceTime]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflowY: 'auto',
        maxHeight,
        WebkitOverflowScrolling: 'touch', // smooth scrolling on iOS
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default React.memo(ScrollableArea);
