export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export const formatDate = value => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
export const normalizeText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
