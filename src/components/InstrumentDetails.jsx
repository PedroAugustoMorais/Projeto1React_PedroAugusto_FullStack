import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from '@mui/material';
import InstrumentArt from './InstrumentArt';
import { money } from './format';

export default function InstrumentDetails({ instrument, onClose, onAdd, selectedQuantity }) {
  if (!instrument) return null;
  return <Dialog open onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="detail-title">
    <DialogTitle id="detail-title" className="dialog-title">Conheça o instrumento<Button onClick={onClose} aria-label="Fechar detalhes">✕</Button></DialogTitle>
    <DialogContent>
      <div className="detail-art" style={{ background: instrument.color }}><InstrumentArt type={instrument.art} /></div>
      <div className="detail-heading"><h2>{instrument.name}</h2><Chip label={instrument.category} size="small" /></div>
      <p className="muted">{instrument.model}</p><p>{instrument.pitch}</p>
      <dl className="detail-list"><div><dt>Diária</dt><dd>{money(instrument.dailyPrice)}</dd></div><div><dt>Incluído no kit</dt><dd>{instrument.kit}</dd></div><div><dt>Estoque total</dt><dd>{instrument.stock} {instrument.stock === 1 ? 'unidade' : 'unidades'}</dd></div></dl>
      <div className="source-box"><span className="eyebrow">INFORMAÇÕES DA API PÚBLICA</span><h3>{instrument.apiName}</h3><p>{instrument.description}</p>{instrument.descriptionLanguage !== 'pt' && <small>Descrição disponível em inglês na fonte.</small>}<a href={instrument.sourceUrl} target="_blank" rel="noreferrer">Consultar fonte no Wikidata ↗</a></div>
      <p className="fine-print">As especificações do kit, diárias e estoque pertencem ao catálogo fictício desta demonstração. A disponibilidade é conferida para as datas escolhidas.</p>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Voltar</Button><Button variant="contained" disabled={selectedQuantity >= instrument.stock} onClick={() => { onAdd(instrument.id); onClose(); }}>{selectedQuantity >= instrument.stock ? 'Limite de unidades atingido' : 'Adicionar à reserva'}</Button></DialogActions>
  </Dialog>;
}
