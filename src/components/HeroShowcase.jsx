import React, { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export const UNIVERSOS = [
  { id: 'fantasia', name: 'Fantasia', genre: 'Fantasia', label: 'PARA ALÉM DO POSSÍVEL', title: 'FANTASIA', coverTitle: 'ENTRE\nMUNDOS', coverSubtitle: 'O impossível começa na primeira página.', word: 'IMAGINE', description: 'Portais, jornadas e mundos que só existem quando você abre um livro. Guarde as capas das histórias que levam você mais longe.', detail: 'Toda grande aventura começa com uma escolha.', symbol: 'moon' },
  { id: 'classicos', name: 'Clássicos', genre: 'Literatura brasileira', label: 'O TEMPO NÃO APAGA', title: 'CLÁSSICOS', coverTitle: 'ECOS DO\nTEMPO', coverSubtitle: 'Algumas histórias nunca terminam.', word: 'REVIVA', description: 'Edições antigas, dedicatórias e páginas que atravessam gerações. Encontre um novo lugar para os livros que sempre têm algo a dizer.', detail: 'O passado também pode ser sua próxima descoberta.', symbol: 'hourglass' },
  { id: 'poesia', name: 'Poesia', genre: 'Poesia', label: 'SINTA CADA PALAVRA', title: 'POESIA', coverTitle: 'FRAG\nMENTOS', coverSubtitle: 'Um universo inteiro entre dois versos.', word: 'SINTA', description: 'Palavras que ficam. Versos que encontram você. Colecione os livros que transformam pequenos instantes em algo que dura para sempre.', detail: 'Alguns universos cabem em poucas linhas.', symbol: 'leaf' },
];

function Sigil({ kind, className = '' }) {
  return <svg className={className} width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    {kind === 'moon' ? <><path d="M63 14A36 36 0 1 0 84 71 31 31 0 0 1 63 14Z"/><path d="m70 37 3-9 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><circle cx="42" cy="65" r="3"/><path d="m21 23 5 5m53-13v7m-3-4h6"/></> : kind === 'hourglass' ? <><path d="M27 14h46M27 86h46M31 14c0 21 7 26 19 36-12 10-19 15-19 36m38-72c0 21-7 26-19 36 12 10 19 15 19 36"/><path d="m36 25 14 15 14-15M38 77l12-15 12 15M16 50h8m52 0h8"/><circle cx="50" cy="50" r="41" opacity=".3"/></> : <><path d="M50 83V30m0 34c-23-2-33-14-29-33 19 2 30 12 29 33Zm0 10c24-3 36-17 31-39-19 2-31 14-31 39Zm0-25c-15-15-14-32 0-44 14 12 15 29 0 44Z"/><path d="m18 78 6-3m53 5-6-4M14 17l6 5m65-10-5 6"/></>}
  </svg>;
}

export default function HeroShowcase({ activeIndex, onChange, books, coverUrls, onNewBook, onExplore, onOpenBook }) {
  const sceneRef = useRef(null);
  const tabRefs = useRef([]);
  const pointerStart = useRef(null);
  const universe = UNIVERSOS[activeIndex];
  const featured = books.find(book => book.genero === universe.genre);
  const featuredUrl = featured ? coverUrls.get(featured.id) : null;

  useEffect(() => {
    const scene = sceneRef.current;
    const allowed = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!allowed) return;
    let frame;
    const move = event => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
        scene.style.setProperty('--pointer-x', x.toFixed(3));
        scene.style.setProperty('--pointer-y', y.toFixed(3));
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      scene.style.setProperty('--pointer-x', '0');
      scene.style.setProperty('--pointer-y', '0');
    };
    scene.addEventListener('pointermove', move);
    scene.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(frame); scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerleave', reset); };
  }, []);

  const change = direction => onChange((activeIndex + direction + UNIVERSOS.length) % UNIVERSOS.length);
  const keyboardTabs = event => {
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (activeIndex + 1) % UNIVERSOS.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (activeIndex + UNIVERSOS.length - 1) % UNIVERSOS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = UNIVERSOS.length - 1;
    if (next !== undefined) { event.preventDefault(); onChange(next); tabRefs.current[next]?.focus(); }
  };

  return <section className="showcase" ref={sceneRef} aria-labelledby="hero-title"
    onPointerDown={event => { if (event.pointerType === 'touch') pointerStart.current = { x: event.clientX, y: event.clientY }; }}
    onPointerCancel={() => { pointerStart.current = null; }}
    onPointerUp={event => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start || event.target.closest('button,a,input,select,textarea')) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.5) change(dx < 0 ? 1 : -1);
    }}>
    <div className="world-background" aria-hidden="true"><div className="world-glow"/><div className="world-grid"/><div className="world-horizon"/><div className="world-slice slice-one"/><div className="world-slice slice-two"/><div className="rain-field">{Array.from({ length: 26 }, (_, index) => <i key={index} style={{ '--left': `${(index * 37 + 9) % 100}%`, '--delay': `${-(index * 1.7) % 11}s`, '--duration': `${6 + index % 5}s` }}/>)}</div><span className="world-word" key={universe.id}>{universe.word}</span></div>
    <div className="showcase-side" aria-hidden="true"><span>SEU ACERVO. SEU UNIVERSO.</span><i/><Icon name="book" size={29}/><small>R / {String(activeIndex + 1).padStart(2, '0')}</small></div>

    <div className="showcase-frame" key={universe.id} id={`universe-panel-${activeIndex}`} role="tabpanel" aria-labelledby={`universe-tab-${activeIndex}`}>
      <div className="showcase-art">
        <div className="artifact-rings" aria-hidden="true"><i/><i/><i/><b>+</b><b>+</b><b>+</b></div>
        <div className="artifact-coordinate coord-top" aria-hidden="true">RARA ARCHIVE <span>0{activeIndex + 1} — ∞</span></div>
        <div className="artifact-coordinate coord-bottom" aria-hidden="true">PÁGINAS QUE ABREM <span>OUTROS MUNDOS.</span></div>
        <div className="hero-book-parallax"><div className="hero-book-float"><div className={`hero-book ${featured ? 'real-cover' : ''}`}>
          <div className="hero-book-pages"/><div className="hero-book-spine"><span>{featured ? featured.titulo : universe.coverTitle.replace('\n', ' ')}</span><Icon name="spark" size={16}/></div>
          <div className="hero-book-front">
            {featured ? <img src={featuredUrl} alt={`Livro em destaque: ${featured.titulo}`}/> : <div className="concept-cover" aria-hidden="true"><div className="cover-corners"/><span className="concept-edition">RARA / UNIVERSOS / 0{activeIndex + 1}</span><span className="concept-category">{universe.name}</span><strong>{universe.coverTitle}</strong><div className="concept-symbol"><div/><Sigil kind={universe.symbol}/><div/></div><span className="concept-subtitle">{universe.coverSubtitle}</span><span className="concept-footer">HISTÓRIAS SEM LIMITES <Icon name="spark" size={15}/></span></div>}
          </div>
        </div></div></div>
        <span className="artifact-label">{featured ? <><i/> DESTAQUE DO SEU ACERVO</> : <><i/> UNIVERSO VISUAL · CAPA ILUSTRATIVA</>}</span>
      </div>

      <div className="showcase-copy"><div className="universe-kicker"><span className="status-light"/> UNIVERSO / 0{activeIndex + 1}</div><span className="showcase-label">{universe.label}</span><h1 id="hero-title">{universe.title}</h1><div className="universe-description"><Sigil kind={universe.symbol}/><div><h2>ABRA UM NOVO MUNDO.</h2><p>{universe.description}</p></div></div><div className="showcase-abilities" aria-label="Recursos do aplicativo"><div><Icon name="image" size={27}/><span>CAPAS DA GALERIA</span></div><div><Icon name="book" size={27}/><span>ACERVO PESSOAL</span></div><div><Icon name="shield" size={27}/><span>SALVO NO APARELHO</span></div></div><button type="button" className="showcase-cta" onClick={onNewBook}>CADASTRAR LIVRO <Icon name="arrow" size={22}/></button><button type="button" className="showcase-secondary" onClick={() => featured ? onOpenBook(featured.id) : onExplore(universe.genre)}>{featured ? `VER ${featured.titulo}` : 'EXPLORAR ESSE UNIVERSO'}<Icon name="arrow" size={16}/></button><p className="showcase-quote">{universe.detail}</p></div>
    </div>

    <div className="universe-rail"><span className="rail-label" aria-hidden="true">ESCOLHA SEU UNIVERSO</span><div role="tablist" aria-label="Universos literários" aria-orientation="vertical" onKeyDown={keyboardTabs}>{UNIVERSOS.map((item, index) => <button type="button" ref={node => { tabRefs.current[index] = node; }} key={item.id} id={`universe-tab-${index}`} role="tab" aria-selected={index === activeIndex} aria-controls={index === activeIndex ? `universe-panel-${index}` : undefined} tabIndex={index === activeIndex ? 0 : -1} aria-label={`Universo ${item.name}`} className={`universe-tab ${index === activeIndex ? 'active' : ''}`} onClick={() => onChange(index)}><Sigil kind={item.symbol}/><span>0{index + 1}</span></button>)}</div></div>
    <div className="showcase-bottom"><span className="showcase-scroll"><span/> DESÇA PARA CRIAR SUA COLEÇÃO</span><div className="showcase-pagination"><button type="button" aria-label="Universo anterior" onClick={() => change(-1)}><Icon name="arrow" size={18}/></button><span><strong>0{activeIndex + 1}</strong> / 03</span><button type="button" aria-label="Próximo universo" onClick={() => change(1)}><Icon name="arrow" size={18}/></button></div><span className="showcase-bottom-brand">LIVROS COM PASSADO. HISTÓRIAS COM FUTURO.</span></div>
  </section>;
}
