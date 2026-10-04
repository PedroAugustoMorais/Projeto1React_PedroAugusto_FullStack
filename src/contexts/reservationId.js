// O endereço Network em HTTP não é um contexto seguro: randomUUID pode
// não existir. Este código é apenas um identificador da simulação local,
// sem uso para autenticação ou segurança.
export function createReservationId(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') {
    return `AS-${cryptoApi.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;
  }
  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = new Uint8Array(8);
    cryptoApi.getRandomValues(bytes);
    return `AS-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }
  return `AS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
}
