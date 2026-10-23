import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    const move = event => {
      if (!media.matches || motion.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
        cursor.classList.add('is-visible');
        cursor.classList.toggle('is-hovering', Boolean(event.target.closest('button,a,input,select,textarea')));
      });
    };
    const hide = () => { cancelAnimationFrame(frame); cursor.classList.remove('is-visible'); };
    document.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', hide); window.removeEventListener('blur', hide); };
  }, []);
  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true"><span/></div>;
}
