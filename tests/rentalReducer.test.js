import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, rentalReducer, rentalDays, dateError, availableStock, validateReservation, parseSavedReservations } from '../src/contexts/rentalReducer.js';

const guitar = { id: 'Q31561', name: 'Violão', dailyPrice: 35, stock: 3, art: 'acoustic', color: '#ede0cc' };
const drum = { id: 'Q128309', name: 'Bateria', dailyPrice: 95, stock: 1, art: 'drums', color: '#e8d5ce' };
const customer = { name: 'Pedro Teste', email: 'pedro@example.com' };
const state = () => ({ ...initialState, status: 'success', instruments: [guitar, drum], cart: [], reservations: [] });
const confirm = (s, overrides = {}) => rentalReducer(s, { type: 'CONFIRM_RESERVATION', payload: { customer, start: '2099-05-10', end: '2099-05-12', id: 'AS-TEST', createdAt: '2026-10-06T12:00:00Z', ...overrides } });

test('diárias usam datas válidas e a devolução exclusiva, inclusive na virada do mês', () => {
  assert.equal(rentalDays('2026-10-31', '2026-11-02'), 2);
  assert.equal(rentalDays('2028-02-28', '2028-03-01'), 2);
  assert.equal(rentalDays('2026-02-30', '2026-03-03'), 0);
  assert.equal(rentalDays('2026-10-10', '2026-10-10'), 0);
  assert.equal(rentalDays('2026-10-12', '2026-10-10'), 0);
});
test('datas passadas, intervalos invertidos e mais de 30 diárias são rejeitados', () => {
  assert.match(dateError('2026-10-05', '2026-10-10', '2026-10-06'), /futura/);
  assert.match(dateError('2026-10-10', '2026-10-10', '2026-10-06'), /depois/);
  assert.match(dateError('2026-10-10', '2026-11-10', '2026-10-06'), /30/);
  assert.equal(dateError('2026-10-06', '2026-11-05', '2026-10-06'), '');
});
test('quantidade respeita estoque, e diminuir até zero remove o instrumento', () => {
  let s = state();
  for (let i = 0; i < 5; i++) s = rentalReducer(s, { type: 'ADD_ITEM', payload: drum.id });
  assert.deepEqual(s.cart, [{ id: drum.id, quantity: 1 }]);
  assert.equal(rentalReducer(s, { type: 'ADD_ITEM', payload: 'invalid' }), s);
  s = rentalReducer(s, { type: 'DECREASE_ITEM', payload: drum.id });
  assert.equal(s.cart.length, 0);
});
test('confirmação integra seleção, período, valor e histórico e limpa a seleção', () => {
  let s = state();
  s.cart = [{ id: guitar.id, quantity: 2 }, { id: drum.id, quantity: 1 }];
  s = confirm(s);
  assert.equal(s.reservations[0].total, (35 * 2 + 95) * 2);
  assert.equal(s.reservations[0].days, 2);
  assert.equal(s.cart.length, 0);
  assert.equal(s.view, 'reservations');
  assert.equal(s.reservations[0].items[0].name, 'Violão');
});
test('dados inválidos não geram reserva', () => {
  const s = state(); s.cart = [{ id: drum.id, quantity: 1 }];
  assert.match(validateReservation(s, { name: 'P', email: 'x' }, '2099-05-10', '2099-05-12'), /nome/);
  assert.match(validateReservation(s, { name: 'Pedro', email: 'sem-email' }, '2099-05-10', '2099-05-12'), /e-mail/);
  assert.equal(confirm(s, { customer: { name: 'P', email: 'x' } }), s);
});
test('reservas sobrepostas bloqueiam estoque, datas consecutivas permitem nova reserva', () => {
  let s = state(); s.cart = [{ id: drum.id, quantity: 1 }];
  s = confirm(s); s.cart = [{ id: drum.id, quantity: 1 }];
  assert.match(validateReservation(s, customer, '2099-05-11', '2099-05-13'), /unidades/);
  assert.equal(confirm(s, { start: '2099-05-11', end: '2099-05-13' }), s);
  assert.equal(validateReservation(s, customer, '2099-05-12', '2099-05-14'), '');
});
test('cancelamento libera estoque e mantém o histórico', () => {
  let s = state(); s.cart = [{ id: drum.id, quantity: 1 }]; s = confirm(s);
  assert.equal(availableStock(drum, '2099-05-10', '2099-05-12', s.reservations), 0);
  s = rentalReducer(s, { type: 'CANCEL_RESERVATION', payload: 'AS-TEST' });
  assert.equal(s.reservations.length, 1);
  assert.equal(s.reservations[0].status, 'cancelled');
  assert.equal(availableStock(drum, '2099-05-10', '2099-05-12', s.reservations), 1);
});
test('estoque conta o pico simultâneo e não soma reservas consecutivas', () => {
  const base = { status: 'confirmed', items: [{ id: guitar.id, quantity: 1 }] };
  const reservations = [{ ...base, start: '2099-05-10', end: '2099-05-12' }, { ...base, start: '2099-05-12', end: '2099-05-14' }];
  assert.equal(availableStock(guitar, '2099-05-10', '2099-05-14', reservations), 2);
  assert.equal(availableStock(guitar, '2099-05-10', '2099-05-14', [...reservations, { ...base, start: '2099-05-11', end: '2099-05-13' }]), 1);
});
test('persistência recupera histórico válido e ignora registros alterados', () => {
  const s = state(); s.cart = [{ id: guitar.id, quantity: 1 }];
  const reservation = confirm(s).reservations[0];
  assert.deepEqual(parseSavedReservations(JSON.stringify([reservation])), [reservation]);
  assert.deepEqual(parseSavedReservations(JSON.stringify([{ ...reservation, total: 0 }, { id: 'incompleto' }])), []);
  assert.throws(() => parseSavedReservations('{invalid'));
});
