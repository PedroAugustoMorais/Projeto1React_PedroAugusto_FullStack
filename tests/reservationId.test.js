import test from 'node:test';
import assert from 'node:assert/strict';
import { createReservationId } from '../src/contexts/reservationId.js';

test('gera identificador com randomUUID quando disponível', () => {
  assert.equal(createReservationId({ randomUUID: () => '12345678-abcd-ef01-2345-6789abcdef01' }), 'AS-12345678ABCDEF01');
});
test('confirmação pode gerar identificador em HTTP Network sem randomUUID', () => {
  const cryptoApi = { getRandomValues: bytes => { bytes.fill(171); return bytes; } };
  assert.equal(createReservationId(cryptoApi), 'AS-ABABABABABABABAB');
});
test('continua funcionando mesmo sem API crypto', () => {
  assert.match(createReservationId(null), /^AS-[A-Z0-9]+-[A-Z0-9]+$/);
});
