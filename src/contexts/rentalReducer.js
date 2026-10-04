export const STORAGE_KEY = 'alugasom-reservations-v1';
export const initialState = {
  instruments: [], status: 'idle', error: '', view: 'catalog',
  cart: [], reservations: [], storageError: '',
};

export function todayISO() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const date = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === value ? date : NaN;
}

// Devolução é exclusiva: retirar dia 10 e devolver dia 12 corresponde a 2 diárias.
export function rentalDays(start, end) {
  const difference = (parseDate(end) - parseDate(start)) / 86400000;
  return Number.isFinite(difference) && difference > 0 ? difference : 0;
}

export function dateError(start, end, today = todayISO()) {
  if (!Number.isFinite(parseDate(start)) || !Number.isFinite(parseDate(end))) return 'Informe a data de retirada e de devolução.';
  if (start < today) return 'A retirada deve ser hoje ou em uma data futura.';
  const days = rentalDays(start, end);
  if (!days) return 'A devolução deve ser depois da retirada.';
  if (days > 30) return 'O período máximo é de 30 diárias.';
  return '';
}

export function availableStock(item, start, end, reservations) {
  // Reservas com devolução no dia da retirada não se sobrepõem.
  // Conta o pico simultâneo; duas reservas consecutivas não somam o estoque.
  const events = [];
  reservations.filter(r => r.status === 'confirmed' && r.start < end && start < r.end).forEach(r => {
    const quantity = r.items.filter(i => i.id === item.id).reduce((n, i) => n + i.quantity, 0);
    events.push({ date: r.start < start ? start : r.start, delta: quantity });
    events.push({ date: r.end > end ? end : r.end, delta: -quantity });
  });
  events.sort((a, b) => a.date.localeCompare(b.date) || a.delta - b.delta);
  let used = 0;
  let peak = 0;
  events.forEach(event => { used += event.delta; peak = Math.max(peak, used); });
  return Math.max(0, item.stock - peak);
}

export function validateReservation(state, customer, start, end) {
  if (!customer?.name?.trim() || customer.name.trim().length < 3) return 'Informe seu nome com pelo menos 3 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email?.trim() || '')) return 'Informe um e-mail válido.';
  const error = dateError(start, end);
  if (error) return error;
  if (!state.cart.length) return 'Selecione pelo menos um instrumento.';
  for (const entry of state.cart) {
    const instrument = state.instruments.find(i => i.id === entry.id);
    if (!instrument || !Number.isInteger(entry.quantity) || entry.quantity < 1) return 'A seleção contém um instrumento inválido.';
    if (entry.quantity > availableStock(instrument, start, end, state.reservations)) {
      return `Não há unidades suficientes de ${instrument.name} nesse período. Reduza a quantidade ou escolha outras datas.`;
    }
  }
  return '';
}

export function rentalReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': return { ...state, status: 'loading', error: '' };
    case 'FETCH_SUCCESS': return { ...state, status: 'success', instruments: action.payload, error: '' };
    case 'FETCH_ERROR': return { ...state, status: 'error', error: action.payload };
    case 'SET_VIEW': return { ...state, view: action.payload };
    case 'ADD_ITEM': {
      const instrument = state.instruments.find(i => i.id === action.payload);
      if (!instrument) return state;
      const existing = state.cart.find(i => i.id === instrument.id);
      if (existing?.quantity >= instrument.stock) return state;
      return { ...state, cart: existing
        ? state.cart.map(i => i.id === instrument.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.cart, { id: instrument.id, quantity: 1 }] };
    }
    case 'DECREASE_ITEM': return { ...state, cart: state.cart.map(i => i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0) };
    case 'REMOVE_ITEM': return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };
    case 'CLEAR_CART': return { ...state, cart: [] };
    case 'CONFIRM_RESERVATION': {
      const { customer, start, end, id, createdAt } = action.payload;
      if (validateReservation(state, customer, start, end)) return state;
      const days = rentalDays(start, end);
      const items = state.cart.map(entry => {
        const instrument = state.instruments.find(i => i.id === entry.id);
        return { id: instrument.id, name: instrument.name, dailyPrice: instrument.dailyPrice, quantity: entry.quantity, art: instrument.art, color: instrument.color };
      });
      const total = items.reduce((sum, i) => sum + i.dailyPrice * i.quantity * days, 0);
      const reservation = { id, createdAt, customer: { name: customer.name.trim(), email: customer.email.trim() }, start, end, days, total, items, status: 'confirmed' };
      return { ...state, reservations: [reservation, ...state.reservations], cart: [], view: 'reservations' };
    }
    case 'CANCEL_RESERVATION': return { ...state, reservations: state.reservations.map(r => r.id === action.payload ? { ...r, status: 'cancelled' } : r) };
    case 'STORAGE_ERROR': return { ...state, storageError: action.payload };
    default: return state;
  }
}

// O armazenamento local pode estar ausente, corrompido ou ter sido editado.
export function parseSavedReservations(raw) {
  const data = JSON.parse(raw || '[]');
  if (!Array.isArray(data)) throw new Error('Formato inválido');
  return data.filter(r =>
    r && typeof r.id === 'string' && typeof r.createdAt === 'string' &&
    ['confirmed', 'cancelled'].includes(r.status) &&
    typeof r.customer?.name === 'string' && typeof r.customer?.email === 'string' &&
    rentalDays(r.start, r.end) === r.days && r.days > 0 && r.days <= 30 &&
    Array.isArray(r.items) && r.items.length > 0 && r.items.every(i =>
      typeof i.id === 'string' && typeof i.name === 'string' && typeof i.art === 'string' &&
      typeof i.color === 'string' && Number.isFinite(i.dailyPrice) && i.dailyPrice > 0 &&
      Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 3
    ) && r.total === r.items.reduce((sum, i) => sum + i.dailyPrice * i.quantity * r.days, 0)
  );
}
