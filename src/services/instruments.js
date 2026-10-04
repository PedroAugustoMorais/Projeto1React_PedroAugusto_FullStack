import { inventory } from '../data/inventory.js';

export const API_URL = 'https://www.wikidata.org/w/api.php';

export function buildCatalogUrl() {
  const params = new URLSearchParams({
    action: 'wbgetentities', ids: inventory.map(item => item.id).join('|'),
    props: 'labels|descriptions', languages: 'pt|en', languagefallback: '1',
    format: 'json', origin: '*',
  });
  return `${API_URL}?${params}`;
}

// AJAX: busca JSON real e integra os resultados aos dados da locadora.
export async function fetchInstruments(signal) {
  const response = await fetch(buildCatalogUrl(), { signal });
  if (!response.ok) throw new Error(`A API retornou um erro (${response.status}). Tente novamente.`);
  const data = await response.json();
  if (data.error || !data.entities) throw new Error('A API não retornou um catálogo válido. Tente novamente.');
  return inventory.map(item => {
    const entity = data.entities[item.id];
    const name = entity?.labels?.pt?.value || entity?.labels?.en?.value;
    if (!name || entity.missing !== undefined) throw new Error('Um instrumento não foi encontrado na API. Tente novamente.');
    const description = entity.descriptions?.pt || entity.descriptions?.en;
    return {
      ...item, name: item.alias || name, apiName: name,
      description: description?.value || 'A API não informou uma descrição para este instrumento.',
      descriptionLanguage: description?.language || 'pt',
      sourceUrl: `https://www.wikidata.org/wiki/${item.id}`,
    };
  });
}
