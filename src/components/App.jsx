import { useState } from 'react';
import { Alert, Badge, Button, Snackbar } from '@mui/material';
import { useRental } from '../contexts/RentalContext';
import Catalog from './Catalog';
import Reservations from './Reservations';
import About from './About';
import ReservationDrawer from './ReservationDrawer';

export default function App() {
  const { state, dispatch } = useRental();
  const [cartOpen, setCartOpen] = useState(false);
  const [message, setMessage] = useState('');
  const count = state.cart.reduce((n, i) => n + i.quantity, 0);
  function navigate(view) { dispatch({ type: 'SET_VIEW', payload: view }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  return <>
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <header className="site-header"><div className="header-inner"><button className="brand" onClick={() => navigate('catalog')} aria-label="AlugaSom, ir para o catálogo"><span className="brand-icon">♪</span>Aluga<span>Som</span><i>INSTRUMENTOS</i></button><nav aria-label="Menu principal"><button className={state.view === 'catalog' ? 'active' : ''} aria-current={state.view === 'catalog' ? 'page' : undefined} onClick={() => navigate('catalog')}>Instrumentos</button><button className={state.view === 'reservations' ? 'active' : ''} aria-current={state.view === 'reservations' ? 'page' : undefined} onClick={() => navigate('reservations')}>Minhas reservas</button><button className={state.view === 'about' ? 'active' : ''} aria-current={state.view === 'about' ? 'page' : undefined} onClick={() => navigate('about')}>Como funciona</button></nav><Badge badgeContent={count} color="primary"><Button variant="outlined" onClick={() => setCartOpen(true)} aria-label={`Abrir minha seleção, ${count} instrumentos`}>Minha seleção <span className="bag-icon">♧</span></Button></Badge></div></header>
    <main id="main-content" className="main-container">{state.storageError && <Alert severity="warning" sx={{ mt: 2 }}>{state.storageError}</Alert>}{state.view === 'catalog' && <Catalog onOpenCart={() => setCartOpen(true)} notify={setMessage} />}{state.view === 'reservations' && <Reservations notify={setMessage} />}{state.view === 'about' && <About />}</main>
    <footer className="site-footer"><div><strong>♪ AlugaSom</strong><p>Seu próximo som começa aqui.</p></div><p>Projeto acadêmico · Reservas simuladas<br /><span>Dados de instrumentos: Wikidata</span></p><span className="footer-year">2026</span></footer>
    <ReservationDrawer open={cartOpen} onClose={() => setCartOpen(false)} notify={setMessage} />
    <Snackbar open={Boolean(message)} autoHideDuration={4500} onClose={() => setMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="success" onClose={() => setMessage('')} variant="filled">{message}</Alert></Snackbar>
  </>;
}
