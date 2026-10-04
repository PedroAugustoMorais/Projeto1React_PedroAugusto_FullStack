import { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import { fetchInstruments } from '../services/instruments';
import { initialState, rentalReducer, parseSavedReservations, STORAGE_KEY, validateReservation } from './rentalReducer';
import { createReservationId } from './reservationId';

const RentalContext = createContext(null);

function initializeState() {
  try { return { ...initialState, reservations: parseSavedReservations(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return { ...initialState, storageError: 'Não foi possível recuperar as reservas salvas neste navegador.' }; }
}

export function RentalProvider({ children }) {
  const [state, dispatch] = useReducer(rentalReducer, undefined, initializeState);
  const controller = useRef(null);

  const loadCatalog = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const timeout = setTimeout(() => current.abort('timeout'), 20000);
    dispatch({ type: 'FETCH_START' });
    try {
      const instruments = await fetchInstruments(current.signal);
      if (!current.signal.aborted) dispatch({ type: 'FETCH_SUCCESS', payload: instruments });
    } catch (error) {
      if (!current.signal.aborted || current.signal.reason === 'timeout') {
        dispatch({ type: 'FETCH_ERROR', payload: current.signal.reason === 'timeout'
          ? 'A API demorou para responder. Confira sua conexão e tente novamente.'
          : 'Não foi possível carregar os instrumentos da API pública. Confira sua conexão e tente novamente.' });
      }
    } finally { clearTimeout(timeout); }
  }, []);

  useEffect(() => { loadCatalog(); return () => controller.current?.abort(); }, [loadCatalog]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reservations)); }
    catch { dispatch({ type: 'STORAGE_ERROR', payload: 'As reservas estão disponíveis nesta sessão, mas não puderam ser salvas. Elas serão perdidas ao recarregar a página.' }); }
  }, [state.reservations]);

  function confirmReservation(customer, start, end) {
    const error = validateReservation(state, customer, start, end);
    if (error) return error;
    dispatch({ type: 'CONFIRM_RESERVATION', payload: { customer, start, end, id: createReservationId(), createdAt: new Date().toISOString() } });
    return '';
  }

  return <RentalContext.Provider value={{ state, dispatch, loadCatalog, confirmReservation }}>{children}</RentalContext.Provider>;
}

export function useRental() {
  const context = useContext(RentalContext);
  if (!context) throw new Error('useRental deve ser usado dentro de RentalProvider.');
  return context;
}
