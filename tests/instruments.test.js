import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchInstruments, buildCatalogUrl } from '../src/services/instruments.js';
import { inventory } from '../src/data/inventory.js';

test('URL solicita JSON real em português e libera CORS', () => {
  const url = new URL(buildCatalogUrl());
  assert.equal(url.searchParams.get('action'), 'wbgetentities');
  assert.equal(url.searchParams.get('format'), 'json');
  assert.equal(url.searchParams.get('origin'), '*');
  assert.equal(url.searchParams.get('ids').split('|').length, 8);
});
test('catálogo integra campos remotos e configuração local', async t => {
  const entities = Object.fromEntries(inventory.map(item => [item.id, { labels: { pt: { value: `Nome remoto ${item.id}` } }, descriptions: { pt: { value: 'Descrição remota', language: 'pt' } } }]));
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ entities }) }));
  const catalog = await fetchInstruments();
  assert.equal(catalog.length, 8);
  assert.equal(catalog[1].name, `Nome remoto ${inventory[1].id}`);
  assert.equal(catalog[0].description, 'Descrição remota');
  assert.equal(catalog[0].dailyPrice, 35);
});
test('falha HTTP e JSON incompleto são erros visíveis, sem catálogo fictício de fallback', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  await assert.rejects(fetchInstruments(), /503/);
  mock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ entities: {} }) }));
  await assert.rejects(fetchInstruments(), /não foi encontrado/);
});
