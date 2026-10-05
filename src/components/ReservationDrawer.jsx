import { useState } from 'react';
import { Drawer, Button, TextField, Alert, Divider } from '@mui/material';
import { useRental } from '../contexts/RentalContext';
import { todayISO, rentalDays, dateError, availableStock } from '../contexts/rentalReducer';
import InstrumentArt from './InstrumentArt';
import { money } from './format';

export default function ReservationDrawer({ open, onClose, notify }) {
  const { state, dispatch, confirmReservation } = useRental();
  const [start, setStart] = useState(todayISO);
  const [end, setEnd] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const days = rentalDays(start, end);
  const periodError = end ? dateError(start, end) : '';
  const entries = state.cart.map(entry => ({ ...state.instruments.find(i => i.id === entry.id), quantity: entry.quantity }));
  const dailyTotal = entries.reduce((sum, i) => sum + i.dailyPrice * i.quantity, 0);
  function update(setter) { return e => { setter(e.target.value); setError(''); }; }
  function submit(event) {
    event.preventDefault();
    const validation = confirmReservation({ name, email }, start, end);
    if (validation) { setError(validation); return; }
    onClose(); setError(''); setName(''); setEmail(''); setEnd('');
    notify('Reserva simulada confirmada! Nenhuma cobrança foi realizada.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: 'reservation-drawer' }}>
    <div className="drawer-heading"><div><span className="eyebrow">SEU PRÓXIMO ENSAIO</span><h2>Minha seleção</h2></div><Button aria-label="Fechar seleção" onClick={onClose}>✕</Button></div>
    {!entries.length ? <div className="empty-panel"><span className="empty-icon">♪</span><h3>Seu som começa com uma escolha</h3><p>Adicione um instrumento do catálogo para simular uma reserva.</p><Button variant="contained" onClick={onClose}>Explorar instrumentos</Button></div> : <form onSubmit={submit} noValidate>
      <div className="drawer-items">{entries.map(item => <div key={item.id} className="selection-item"><div className="selection-art" style={{ background: item.color }}><InstrumentArt type={item.art} /></div><div className="selection-info"><h3>{item.name}</h3><span>{money(item.dailyPrice)} / diária</span><div className="quantity"><button type="button" aria-label={`Diminuir quantidade de ${item.name}`} onClick={() => { dispatch({ type: 'DECREASE_ITEM', payload: item.id }); setError(''); }}>−</button><span aria-label="Quantidade">{item.quantity}</span><button type="button" aria-label={`Aumentar quantidade de ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => { dispatch({ type: 'ADD_ITEM', payload: item.id }); setError(''); }}>+</button><button type="button" className="remove" onClick={() => { dispatch({ type: 'REMOVE_ITEM', payload: item.id }); setError(''); }}>Remover</button></div>{days > 0 && !periodError && item.quantity > availableStock(item, start, end, state.reservations) && <span className="availability-error">Estoque insuficiente nesse período.</span>}</div></div>)}</div>
      <Divider /><h3 className="form-heading">Quando você vai tocar?</h3>
      <div className="date-fields"><TextField label="Retirada" type="date" value={start} onChange={update(setStart)} InputLabelProps={{ shrink: true }} inputProps={{ min: todayISO() }} fullWidth required /><TextField label="Devolução" type="date" value={end} onChange={update(setEnd)} InputLabelProps={{ shrink: true }} inputProps={{ min: start || todayISO() }} fullWidth required /></div>
      <p className="fine-print">De 1 a 30 diárias. Retirar dia 10 e devolver dia 12 equivale a 2 diárias.</p>
      {periodError && <Alert severity="warning">{periodError}</Alert>}
      <h3 className="form-heading">Quem vai reservar?</h3><div className="customer-fields"><TextField label="Nome" value={name} onChange={update(setName)} autoComplete="name" inputProps={{ maxLength: 100 }} required fullWidth /><TextField label="E-mail" value={email} onChange={update(setEmail)} autoComplete="email" type="email" inputProps={{ maxLength: 200 }} required fullWidth /></div>
      <div className="rental-summary"><div><span>Diária da seleção</span><strong>{money(dailyTotal)}</strong></div><div><span>Período</span><span>{days && !periodError ? `${days} ${days === 1 ? 'diária' : 'diárias'}` : 'Selecione as datas'}</span></div><Divider /><div className="summary-total"><span>Total estimado</span><strong>{days && !periodError ? money(dailyTotal * days) : '—'}</strong></div></div>
      {error && <Alert severity="error" sx={{ mb: 2 }} role="alert">{error}</Alert>}
      <Button fullWidth variant="contained" type="submit" size="large">Confirmar reserva simulada →</Button><p className="fine-print centered">Sem cobrança ou envio de e-mail. Os dados ficam somente neste navegador. Use dados fictícios na demonstração.</p>
    </form>}
  </Drawer>;
}
