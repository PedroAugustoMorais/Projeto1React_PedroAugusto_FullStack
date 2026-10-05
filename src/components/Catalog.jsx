import { useMemo, useState } from 'react';
import { Alert, Button, Chip, Skeleton, TextField, MenuItem } from '@mui/material';
import { useRental } from '../contexts/RentalContext';
import { categories } from '../data/inventory';
import InstrumentArt from './InstrumentArt';
import InstrumentDetails from './InstrumentDetails';
import { money, normalizeText } from './format';

export default function Catalog({ onOpenCart, notify }) {
  const { state, dispatch, loadCatalog } = useRental();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('featured');
  const [detail, setDetail] = useState(null);
  const filtered = useMemo(() => {
    const term = normalizeText(search.trim());
    const list = state.instruments.filter(i => (category === 'Todos' || i.category === category) && normalizeText(`${i.name} ${i.apiName} ${i.model} ${i.category}`).includes(term));
    if (sort === 'price-asc') list.sort((a, b) => a.dailyPrice - b.dailyPrice);
    if (sort === 'price-desc') list.sort((a, b) => b.dailyPrice - a.dailyPrice);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return list;
  }, [state.instruments, search, category, sort]);

  function add(id) {
    dispatch({ type: 'ADD_ITEM', payload: id });
    notify('Instrumento adicionado à sua seleção.');
  }
  function clearFilters() { setSearch(''); setCategory('Todos'); setSort('featured'); }

  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><span className="hero-tag"><span /> MAIS MÚSICA, MAIS POSSIBILIDADES</span><h1 id="hero-title">Seu próximo som<br />começa <em>aqui.</em></h1><p>O instrumento certo para o seu ensaio, estudo ou apresentação. Escolha, reserve e deixe a música acontecer.</p><div className="hero-actions"><Button variant="contained" className="hero-cta" onClick={() => document.getElementById('catalog-title')?.scrollIntoView({ behavior: 'smooth' })}>Encontrar meu instrumento <span>↗</span></Button><span>Diárias a partir de <strong>R$ 35</strong></span></div><div className="hero-proof"><span>✓ Kits completos</span><span>✓ Períodos flexíveis</span><span>✓ Reserva simples</span></div></div>
      <div className="hero-visual"><div className="hero-ring" /><span className="hero-note note-one">♪</span><span className="hero-note note-two">♫</span><InstrumentArt type="acoustic" className="hero-guitar" /><InstrumentArt type="keyboard" className="hero-keyboard" /><div className="hero-label"><span>PARA CADA MOMENTO</span><strong>Um novo som.</strong></div><span className="visual-caption">ENSAIE. EXPLORE. TOQUE.</span></div>
    </section>
    <section className="catalog-section" aria-labelledby="catalog-title">
      <div className="section-heading"><div><span className="eyebrow">ENCONTRE O SEU INSTRUMENTO</span><h2 id="catalog-title">Qual vai ser o som de hoje?</h2></div><span className="catalog-count">{state.status === 'success' ? `${state.instruments.length} instrumentos no catálogo` : 'Carregando catálogo'}</span></div>
      <div className="catalog-toolbar"><div className="category-tabs" role="group" aria-label="Filtrar por categoria">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="search-sort"><TextField label="Buscar instrumento" placeholder="Nome ou categoria" size="small" value={search} onChange={e => setSearch(e.target.value)} type="search" /><TextField select label="Ordenar por" size="small" value={sort} onChange={e => setSort(e.target.value)}><MenuItem value="featured">Destaques</MenuItem><MenuItem value="price-asc">Menor diária</MenuItem><MenuItem value="price-desc">Maior diária</MenuItem><MenuItem value="name">Nome A–Z</MenuItem></TextField></div></div>
      {(state.status === 'loading' || state.status === 'idle') && <div className="instrument-grid" role="status" aria-label="Carregando instrumentos da API">{Array.from({ length: 8 }, (_, i) => <div key={i} className="instrument-card"><Skeleton variant="rounded" height={230} /><div className="card-content"><Skeleton width="65%" /><Skeleton width="90%" /><Skeleton height={55} /></div></div>)}</div>}
      {state.status === 'error' && <div className="empty-panel" role="alert"><span className="empty-icon">↻</span><h3>Vamos tentar de novo?</h3><p>{state.error}</p><Button variant="contained" onClick={loadCatalog}>Tentar novamente</Button></div>}
      {state.status === 'success' && !filtered.length && <div className="empty-panel"><span className="empty-icon">⌕</span><h3>Nenhum instrumento encontrado</h3><p>Experimente outro nome ou selecione uma categoria diferente.</p><Button onClick={clearFilters} variant="outlined">Limpar filtros</Button></div>}
      {state.status === 'success' && filtered.length > 0 && <>
        <p className="results-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'instrumento encontrado' : 'instrumentos encontrados'}</p>
        <div className="instrument-grid">{filtered.map(instrument => {
          const selectedQuantity = state.cart.find(i => i.id === instrument.id)?.quantity || 0;
          return <article key={instrument.id} className="instrument-card"><button className="card-image" style={{ background: instrument.color }} onClick={() => setDetail(instrument)} aria-label={`Ver detalhes de ${instrument.name}`}><span className="category-pill">{instrument.category}</span><InstrumentArt type={instrument.art} /><span className="image-arrow">↗</span></button><div className="card-content"><h3>{instrument.name}</h3><p className="card-model">{instrument.model}</p><p className="card-kit">{instrument.kit}</p><div className="card-price"><div><strong>{money(instrument.dailyPrice)}</strong><span>/ diária</span></div>{selectedQuantity > 0 && <Chip label={`${selectedQuantity} na seleção`} size="small" />}</div><div className="card-actions"><Button variant="contained" fullWidth onClick={() => add(instrument.id)} disabled={selectedQuantity >= instrument.stock}>{selectedQuantity >= instrument.stock ? 'Limite atingido' : '＋ Reservar'}</Button><Button className="detail-button" onClick={() => setDetail(instrument)} aria-label={`Detalhes de ${instrument.name}`}>↗</Button></div></div></article>;
        })}</div>
      </>}
      <div className="catalog-footnote"><span>ⓘ</span><p>Projeto acadêmico: preços e estoque fictícios. Reservas simuladas, sem pagamento ou envio de e-mail.</p></div>
    </section>
    <section className="how-it-works"><div><span className="eyebrow">SIMPLES ASSIM</span><h2>Da escolha ao próximo acorde.</h2></div><div className="steps"><div><b>01</b><h3>Escolha seu som</h3><p>Explore o catálogo e adicione seus instrumentos favoritos.</p></div><div><b>02</b><h3>Defina o período</h3><p>Informe a retirada e a devolução. Veja o valor na hora.</p></div><div><b>03</b><h3>Simule sua reserva</h3><p>Confirme e acompanhe tudo em Minhas reservas.</p></div></div></section>
    {state.cart.length > 0 && <div className="floating-selection"><div><span>♪</span><p><strong>{state.cart.reduce((n, i) => n + i.quantity, 0)} instrumento(s) na seleção</strong><small>Pronto para o próximo passo?</small></p></div><Button variant="contained" onClick={onOpenCart}>Ver minha seleção →</Button></div>}
    <InstrumentDetails instrument={detail} selectedQuantity={state.cart.find(i => i.id === detail?.id)?.quantity || 0} onClose={() => setDetail(null)} onAdd={add} />
  </>;
}
