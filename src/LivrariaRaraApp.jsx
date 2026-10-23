import React, { useEffect, useMemo, useRef, useState } from 'react';
import { escolherCapaDaGaleria, abrirCameraOuGaleria, tirarFotoDaCapa, mensagemDaGaleria, obterArquivoDaCapa } from './lib/camera.js';
import { Capacitor } from '@capacitor/core';
import { excluirLivro, listarLivros, salvarLivro } from './lib/acervo.js';
import Icon from './components/Icon.jsx';
import Dialog from './components/Dialog.jsx';
import HeroShowcase, { UNIVERSOS } from './components/HeroShowcase.jsx';
import CustomCursor from './components/CustomCursor.jsx';

const GENEROS = ['Literatura brasileira', 'Romance', 'Fantasia', 'Poesia', 'História', 'Filosofia', 'Arte', 'Outros'];
const CONSERVACAO = ['Como novo', 'Muito bom', 'Bom', 'Com marcas do tempo'];
const EMPTY_FORM = { titulo: '', autor: '', ano: '', genero: GENEROS[0], conservacao: 'Bom', preco: '', notas: '' };
const normalizar = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const moeda = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const erroDeArmazenamento = error => error?.name === 'QuotaExceededError'
  ? 'O armazenamento do aparelho está cheio. Libere espaço ou escolha uma capa menor.'
  : 'Não foi possível salvar no aparelho. Verifique se o navegador permite armazenamento local e tente novamente.';

function lerTema() {
  try { return localStorage.getItem('rara-visual-tema-v2') || 'dark'; } catch { return 'dark'; }
}

export default function LivrariaRaraApp() {
  const [livros, setLivros] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  // Requisito da aula: o webPath retornado é mantido no estado do React.
  const [fotoCapa, setFotoCapa] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [capturando, setCapturando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [bancoDisponivel, setBancoDisponivel] = useState(true);
  const [mensagem, setMensagem] = useState(null);
  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState('Todos');
  const [ordem, setOrdem] = useState('recentes');
  const [tema, setTema] = useState(lerTema);
  const [universo, setUniverso] = useState(0);
  const [guia, setGuia] = useState(false);
  const [origemAberta, setOrigemAberta] = useState(false);
  const [livroAbertoId, setLivroAbertoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);
  const [apagando, setApagando] = useState(false);
  const bloqueioGaleria = useRef(false);
  const bloqueioGravacao = useRef(false);
  const tituloRef = useRef(null);
  const formRef = useRef(null);
  const acervoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    listarLivros().then(records => {
      if (ativo) setLivros(records);
    }).catch(() => {
      if (ativo) {
        setBancoDisponivel(false);
        setMensagem({ type: 'error', text: 'O armazenamento local está indisponível. Você ainda pode selecionar e visualizar uma capa; para salvar, habilite o armazenamento do navegador.' });
      }
    }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try { localStorage.setItem('rara-visual-tema-v2', tema); } catch { /* A galeria funciona sem preferências persistentes. */ }
  }, [tema]);

  useEffect(() => () => {
    if (fotoCapa?.webPath?.startsWith('blob:')) URL.revokeObjectURL(fotoCapa.webPath);
  }, [fotoCapa]);

  const capas = useMemo(() => new Map(livros.map(livro => [livro.id, URL.createObjectURL(livro.capa)])), [livros]);
  useEffect(() => () => { for (const url of capas.values()) URL.revokeObjectURL(url); }, [capas]);

  const livrosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const result = livros.filter(livro => (
      (genero === 'Todos' || livro.genero === genero)
      && normalizar(`${livro.titulo} ${livro.autor} ${livro.ano || ''}`).includes(termo)
    ));
    if (ordem === 'titulo') result.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    if (ordem === 'antigos') result.sort((a, b) => (Number(a.ano) || Infinity) - (Number(b.ano) || Infinity));
    return result;
  }, [livros, busca, genero, ordem]);

  const categorias = new Set(livros.map(livro => livro.genero)).size;
  const valorAcervo = livros.reduce((total, livro) => total + (livro.preco || 0), 0);
  const livroAberto = livros.find(livro => livro.id === livroAbertoId);
  const livroParaExcluir = livros.find(livro => livro.id === excluindoId);
  const ocupado = capturando || salvando;

  function atualizarForm(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function irParaCadastro() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    tituloRef.current?.focus({ preventScroll: true });
  }

  // A Promise rejeitada pelo seletor (inclusive ao apertar Voltar) é tratada.
  // Nenhum campo ou foto anterior é apagado se a pessoa cancelar.
  async function escolherGaleria(origem = 'galeria') {
    if (bloqueioGaleria.current || bloqueioGravacao.current) return;
    bloqueioGaleria.current = true;
    setCapturando(true);
    setMensagem(null);
    try {
      const image = await (origem === 'camera'
        ? tirarFotoDaCapa()
        : origem === 'prompt'
          ? abrirCameraOuGaleria()
          : escolherCapaDaGaleria());
      setFotoCapa(image);
      setMensagem({ type: 'success', text: 'Capa selecionada! Complete os dados para guardar este livro.' });
    } catch (error) {
      console.warn('Captura ou seleção finalizada sem nova capa:', error);
      setMensagem(mensagemDaGaleria(error));
    } finally {
      bloqueioGaleria.current = false;
      setCapturando(false);
    }
  }

  function abrirOrigemDaCapa() {
    if (ocupado) return;
    // Android: apresenta o seletor nativo do plugin. Web: escolha acessível em React.
    if (Capacitor.isNativePlatform()) escolherGaleria('prompt');
    else setOrigemAberta(true);
  }

  function limparFormulario() {
    if (bloqueioGaleria.current || bloqueioGravacao.current) return;
    setForm({ ...EMPTY_FORM });
    setFotoCapa(null);
    setEditandoId(null);
  }

  async function cadastrarLivro(event) {
    event.preventDefault();
    if (bloqueioGravacao.current || bloqueioGaleria.current || !bancoDisponivel) return;
    if (!form.titulo.trim() || !form.autor.trim()) {
      setMensagem({ type: 'error', text: 'Preencha o título e o autor do livro.' });
      return;
    }
    if (!fotoCapa) {
      setMensagem({ type: 'error', text: 'Escolha uma capa na galeria antes de guardar o livro.' });
      return;
    }
    bloqueioGravacao.current = true;
    setSalvando(true);
    try {
      const capa = await obterArquivoDaCapa(fotoCapa);
      const anterior = livros.find(livro => livro.id === editandoId);
      const agora = new Date().toISOString();
      const livro = {
        id: editandoId || crypto.randomUUID(),
        titulo: form.titulo.trim(), autor: form.autor.trim(),
        ano: form.ano ? Number(form.ano) : null,
        genero: form.genero, conservacao: form.conservacao,
        preco: form.preco ? Number(form.preco) : null,
        notas: form.notas.trim(), capa,
        createdAt: anterior?.createdAt || agora, updatedAt: agora,
      };
      await salvarLivro(livro);
      // A interface só anuncia sucesso depois que o IndexedDB confirmou a gravação.
      setLivros(previous => [livro, ...previous.filter(item => item.id !== livro.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setForm({ ...EMPTY_FORM });
      setFotoCapa(null);
      setEditandoId(null);
      setMensagem({ type: 'success', text: anterior ? 'Livro atualizado no seu acervo.' : 'Uma nova história guardada. Livro adicionado ao acervo!' });
    } catch (error) {
      setMensagem({ type: 'error', text: error.message?.startsWith('A capa') || error.message?.startsWith('Escolha') || error.message?.startsWith('Não foi possível ler') ? error.message : erroDeArmazenamento(error) });
    } finally {
      bloqueioGravacao.current = false;
      setSalvando(false);
    }
  }

  function editarLivro(livro) {
    if (ocupado) return;
    setForm({ titulo: livro.titulo, autor: livro.autor, ano: livro.ano || '', genero: livro.genero, conservacao: livro.conservacao, preco: livro.preco ?? '', notas: livro.notas });
    setFotoCapa({ webPath: URL.createObjectURL(livro.capa), blob: livro.capa });
    setEditandoId(livro.id);
    setLivroAbertoId(null);
    requestAnimationFrame(irParaCadastro);
  }

  async function confirmarExclusao() {
    if (apagando || ocupado || !excluindoId) return;
    setApagando(true);
    try {
      await excluirLivro(excluindoId);
      setLivros(previous => previous.filter(livro => livro.id !== excluindoId));
      if (editandoId === excluindoId) limparFormulario();
      if (livroAbertoId === excluindoId) setLivroAbertoId(null);
      setExcluindoId(null);
      setMensagem({ type: 'success', text: 'Livro removido do acervo deste aparelho.' });
    } catch (error) {
      setMensagem({ type: 'error', text: erroDeArmazenamento(error) });
    } finally { setApagando(false); }
  }

  return <div className="app" data-universe={UNIVERSOS[universo].id}>
    <CustomCursor/>
    <header className="header">
      <a href="#inicio" className="brand" aria-label="Rara, início"><span className="brand-mark"><Icon name="book" size={28}/></span><span className="brand-type">RARA<span>LIVRARIA & SEBO</span></span></a>
      <nav aria-label="Menu principal" className="nav">
        <a href="#inicio" className="nav-active">Explorar</a>
        <button type="button" onClick={() => acervoRef.current?.scrollIntoView({ behavior: 'smooth' })}><Icon name="grid" size={16}/> Meu acervo</button>
        <button type="button" onClick={() => setGuia(true)}><Icon name="help" size={16}/> Como usar</button>
      </nav>
      <div className="header-actions"><button type="button" className="icon-button theme-toggle" aria-label={tema === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'} onClick={() => setTema(previous => previous === 'light' ? 'dark' : 'light')}><Icon name={tema === 'light' ? 'moon' : 'sun'}/></button><button type="button" className="button button-small" onClick={irParaCadastro}><Icon name="plus" size={17}/><span>Novo livro</span></button></div>
    </header>

    <main id="inicio">
      <HeroShowcase activeIndex={universo} onChange={setUniverso} books={livros} coverUrls={capas} onNewBook={irParaCadastro} onExplore={generoSelecionado => { setGenero(generoSelecionado); setBusca(''); acervoRef.current?.scrollIntoView({ behavior: 'smooth' }); }} onOpenBook={setLivroAbertoId}/>

      <div className="archive-intro"><div><span className="eyebrow">RARA / ARQUIVO PESSOAL</span><h2>O próximo capítulo é seu<span>.</span></h2></div><span className="archive-intro-number">CONTINUE EXPLORANDO <Icon name="arrow" size={17}/></span></div>

      <section className="stats" aria-label="Resumo do acervo"><div><span className="stat-icon"><Icon name="book"/></span><p><strong>{livros.length.toString().padStart(2, '0')}</strong><span>livros no acervo</span></p></div><div><span className="stat-icon"><Icon name="grid"/></span><p><strong>{categorias.toString().padStart(2, '0')}</strong><span>gêneros diferentes</span></p></div><div><span className="stat-icon"><Icon name="spark"/></span><p><strong className="stat-money">{moeda(valorAcervo)}</strong><span>valor catalogado</span></p></div><span className="privacy-note"><Icon name="shield" size={17}/> Seu acervo fica neste aparelho</span></section>

      <div className="workspace">
        <section ref={formRef} className="editor panel" aria-labelledby="editor-title" id="cadastro">
          <div className="section-heading"><span className="section-number">01</span><div><span className="eyebrow">MAIS UMA HISTÓRIA</span><h2 id="editor-title">{editandoId ? 'Editar livro' : 'Cadastrar livro'}</h2></div>{editandoId && <span className="pill">Editando</span>}</div>
          <form onSubmit={cadastrarLivro}>
            <div className={`cover-picker ${fotoCapa ? 'has-cover' : ''}`}>
              {fotoCapa ? <><img src={fotoCapa.webPath} alt="Capa selecionada para o livro" className="selected-cover"/><button type="button" className="cover-remove icon-button" aria-label="Remover capa selecionada" onClick={() => setFotoCapa(null)} disabled={ocupado}><Icon name="close" size={16}/></button><span className="cover-status"><Icon name="check" size={13}/> Capa selecionada</span></> : <div className="cover-empty"><span className="cover-empty-icon"><Icon name="camera" size={29}/></span><h3>A história começa pela capa</h3><p>Tire uma foto do livro ou escolha<br/>uma imagem da galeria.</p><span>JPG, PNG ou outra imagem · até 20 MB</span></div>}
            </div>
            <button type="button" className="button button-camera" onClick={abrirOrigemDaCapa} disabled={ocupado}>{capturando ? <span className="spinner"/> : <Icon name="camera" size={18}/>} {capturando ? 'Abrindo…' : 'Tirar foto / Galeria'}</button>
            <button type="button" className="button button-gallery" onClick={() => escolherGaleria('galeria')} disabled={ocupado}>{capturando ? <span className="spinner"/> : <Icon name="image" size={18}/>} {capturando ? 'Aguarde…' : fotoCapa ? 'Trocar capa na galeria' : 'Escolher capa na galeria'}</button>
            <div className="form-divider"><span>OS DETALHES FAZEM A DIFERENÇA</span></div>
            <fieldset disabled={ocupado}>
              <label className="field">Título do livro <span className="required">*</span><input ref={tituloRef} name="titulo" value={form.titulo} onChange={atualizarForm} placeholder="Qual história vamos guardar?" required maxLength={120}/></label>
              <label className="field">Autor ou autora <span className="required">*</span><input name="autor" value={form.autor} onChange={atualizarForm} placeholder="Quem escreveu esta história?" required maxLength={100}/></label>
              <div className="field-row"><label className="field">Ano da edição<input type="number" name="ano" value={form.ano} onChange={atualizarForm} min="1" max={new Date().getFullYear() + 1} placeholder="Ex.: 1952" inputMode="numeric"/></label><label className="field">Gênero<select name="genero" value={form.genero} onChange={atualizarForm}>{GENEROS.map(item => <option key={item}>{item}</option>)}</select></label></div>
              <div className="field-row"><label className="field">Conservação<select name="conservacao" value={form.conservacao} onChange={atualizarForm}>{CONSERVACAO.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Valor estimado (R$)<input type="number" name="preco" value={form.preco} onChange={atualizarForm} min="0" max="10000000" step="0.01" placeholder="Opcional" inputMode="decimal"/></label></div>
              <label className="field">Uma nota especial <span className="optional">opcional</span><textarea name="notas" value={form.notas} onChange={atualizarForm} placeholder="Dedicatória, edição rara, onde você encontrou…" maxLength={600} rows={2}/></label>
            </fieldset>
            <button type="submit" className="button save-button" disabled={ocupado || !bancoDisponivel || carregando}>{salvando ? <span className="spinner"/> : <Icon name={editandoId ? 'check' : 'plus'} size={18}/>} {salvando ? 'Guardando sua história…' : editandoId ? 'Salvar alterações' : 'Guardar no meu acervo'}<Icon name="arrow" size={18}/></button>
            {(editandoId || fotoCapa || form.titulo || form.autor) && <button type="button" className="reset-button" onClick={limparFormulario} disabled={ocupado}>{editandoId ? 'Cancelar edição' : 'Limpar cadastro'}</button>}
            <p className="form-footnote">Os campos com * são obrigatórios. Adicione uma capa para salvar.</p>
          </form>
        </section>

        <section ref={acervoRef} className="catalog" aria-labelledby="catalog-title" id="acervo">
          <div className="catalog-heading"><div className="section-heading"><span className="section-number">02</span><div><span className="eyebrow">SUA COLEÇÃO PARTICULAR</span><h2 id="catalog-title">Meu acervo <span className="count">{livros.length}</span></h2></div></div><span className="catalog-ornament" aria-hidden="true">✦</span></div>
          <div className="catalog-tools"><label className="search-box"><Icon name="search" size={18}/><input type="search" value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar título ou autor" aria-label="Buscar livro por título ou autor"/></label><select value={ordem} onChange={event => setOrdem(event.target.value)} aria-label="Ordenar livros"><option value="recentes">Mais recentes</option><option value="titulo">Título A–Z</option><option value="antigos">Edições antigas</option></select></div>
          <label className="filter-label">Filtrar por gênero<select aria-label="Filtrar por gênero" value={genero} onChange={event => setGenero(event.target.value)}><option>Todos</option>{GENEROS.map(item => <option key={item}>{item}</option>)}</select></label>
          {carregando ? <div className="catalog-empty"><span className="spinner dark-spinner"/><p>Abrindo suas histórias…</p></div> : livrosFiltrados.length ? <><p className="results-count">{livrosFiltrados.length} {livrosFiltrados.length === 1 ? 'livro encontrado' : 'livros encontrados'}</p><div className="book-grid">{livrosFiltrados.map((livro, index) => <article className="book-card" key={livro.id} style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}><button type="button" className="book-cover-button" onClick={() => setLivroAbertoId(livro.id)} aria-label={`Ver detalhes de ${livro.titulo}`}><img src={capas.get(livro.id)} alt={`Capa de ${livro.titulo}`} loading="lazy"/><span className="book-cover-overlay">Abrir história <Icon name="arrow" size={16}/></span></button><div className="book-card-info"><span className="book-genre">{livro.genero}</span><h3>{livro.titulo}</h3><p>{livro.autor}</p><div className="book-card-footer"><span>{livro.ano || 'Ano não informado'}</span><div><button type="button" className="icon-button" disabled={ocupado} onClick={() => editarLivro(livro)} aria-label={`Editar ${livro.titulo}`}><Icon name="edit" size={16}/></button><button type="button" className="icon-button" disabled={ocupado} onClick={() => setExcluindoId(livro.id)} aria-label={`Excluir ${livro.titulo}`}><Icon name="trash" size={16}/></button></div></div></div></article>)}</div></> : <div className="catalog-empty"><div className="empty-books" aria-hidden="true"><i/><i/><i/></div><span className="eyebrow">{livros.length ? 'VAMOS TENTAR OUTRA BUSCA?' : 'A PRIMEIRA PÁGINA É SUA'}</span><h3>{livros.length ? 'Nenhum livro por aqui.' : 'Grandes acervos começam\ncom um único livro.'}</h3><p>{livros.length ? 'Altere o título, o autor ou o gênero para encontrar sua próxima leitura.' : 'Importe a capa da galeria, conte um pouco sobre o livro e comece sua coleção.'}</p><button type="button" className="text-button" onClick={() => { if (livros.length) { setBusca(''); setGenero('Todos'); } else irParaCadastro(); }}>{livros.length ? 'Limpar filtros' : 'Cadastrar meu primeiro livro'}<Icon name="arrow" size={17}/></button></div>}
          <div className="catalog-note"><span aria-hidden="true">“</span><p>Há livros que a gente lê.<br/><em>E outros que ficam com a gente.</em></p><Icon name="book" size={28}/></div>
        </section>
      </div>
    </main>

    <footer className="footer"><a href="#inicio" className="footer-brand">rara<span>Livros com passado. Histórias com futuro.</span></a><span>Aluno 11 · PPDM II · React + Capacitor</span><button type="button" className="text-button" onClick={() => setGuia(true)}>Precisa de ajuda? <Icon name="help" size={15}/></button></footer>

    {mensagem && <div className={`toast toast-${mensagem.type}`} role={mensagem.type === 'error' ? 'alert' : 'status'}><span className="toast-icon"><Icon name={mensagem.type === 'success' ? 'check' : 'help'} size={19}/></span><p>{mensagem.text}</p><button type="button" className="icon-button" aria-label="Fechar mensagem" onClick={() => setMensagem(null)}><Icon name="close" size={16}/></button></div>}

    {origemAberta && <Dialog title="Como quer adicionar a capa?" onClose={() => { setOrigemAberta(false); setMensagem({ type: 'info', text: 'Seleção cancelada. Seu cadastro foi preservado.' }); }}><p className="dialog-footnote">Use a câmera deste dispositivo ou escolha uma foto que já está salva.</p><div className="source-actions"><button type="button" className="button full-width" onClick={() => { setOrigemAberta(false); escolherGaleria('camera'); }}><Icon name="camera" size={19}/>Tirar foto agora</button><button type="button" className="button button-outline full-width" onClick={() => { setOrigemAberta(false); escolherGaleria('galeria'); }}><Icon name="image" size={19}/>Escolher uma foto da galeria</button><button type="button" className="reset-button" onClick={() => { setOrigemAberta(false); setMensagem({ type: 'info', text: 'Seleção cancelada. Seu cadastro foi preservado.' }); }}>Cancelar</button></div></Dialog>}

    {guia && <Dialog title="Um novo lar para seus livros" onClose={() => setGuia(false)}><div className="guide-steps"><div><span>01</span><p><strong>Encontre a capa</strong>Toque em “Tirar foto / Galeria” para usar a câmera ou selecionar uma imagem. O botão “Escolher capa na galeria” abre diretamente suas fotos.</p></div><div><span>02</span><p><strong>Conte a história</strong>Preencha título e autor. Ano, gênero, conservação, valor e notas ajudam a organizar sua coleção.</p></div><div><span>03</span><p><strong>Guarde e reencontre</strong>Salve o livro. Busque, abra a capa, edite os detalhes ou remova o cadastro quando precisar.</p></div></div><div className="help-note"><Icon name="shield" size={20}/><p>Os livros e as capas ficam salvos neste aparelho e neste navegador. Limpar os dados do aplicativo ou desinstalá-lo apaga o acervo. Não há sincronização entre dispositivos.</p></div><p className="dialog-footnote">Se fechar a câmera ou a galeria sem escolher uma imagem, o cadastro é preservado. Você pode tentar novamente.</p><button type="button" className="button full-width" onClick={() => { setGuia(false); irParaCadastro(); }}>Começar minha coleção<Icon name="arrow" size={17}/></button></Dialog>}

    {livroAberto && <Dialog title="Uma história do seu acervo" onClose={() => setLivroAbertoId(null)} className="book-dialog"><div className="book-detail"><div className="detail-cover"><img src={capas.get(livroAberto.id)} alt={`Capa de ${livroAberto.titulo}`}/></div><span className="book-genre">{livroAberto.genero}</span><h3>{livroAberto.titulo}</h3><p className="detail-author">{livroAberto.autor}</p><dl><div><dt>Edição</dt><dd>{livroAberto.ano || 'Não informada'}</dd></div><div><dt>Conservação</dt><dd>{livroAberto.conservacao}</dd></div><div><dt>Valor estimado</dt><dd>{livroAberto.preco != null ? moeda(livroAberto.preco) : 'Não informado'}</dd></div><div><dt>Guardado em</dt><dd>{new Date(livroAberto.createdAt).toLocaleDateString('pt-BR')}</dd></div></dl>{livroAberto.notas && <p className="detail-notes">{livroAberto.notas}</p>}<button type="button" className="button full-width" disabled={ocupado} onClick={() => editarLivro(livroAberto)}><Icon name="edit" size={17}/>Editar este livro</button></div></Dialog>}

    {livroParaExcluir && <Dialog title="Remover do seu acervo?" onClose={() => { if (!apagando) setExcluindoId(null); }}><p className="delete-text">O cadastro de <strong>{livroParaExcluir.titulo}</strong> e a cópia da capa serão apagados deste aplicativo. A foto original da galeria continua no aparelho.</p><div className="dialog-actions"><button type="button" className="button button-outline" disabled={apagando} onClick={() => setExcluindoId(null)}>Manter livro</button><button type="button" className="button button-danger" disabled={apagando || ocupado} onClick={confirmarExclusao}>{apagando ? 'Removendo…' : 'Remover livro'}</button></div></Dialog>}
  </div>;
}
