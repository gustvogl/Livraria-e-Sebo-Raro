import React, { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function Dialog({ title, children, onClose, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="dialog-header"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" aria-label="Fechar janela" onClick={onClose}><Icon name="close"/></button></div>
    {children}
  </dialog>;
}
