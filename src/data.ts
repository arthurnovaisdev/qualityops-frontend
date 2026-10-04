export type ComplaintStatus = 'OPEN' | 'UNDER_ANALYSIS' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type Complaint = { id: string; title: string; description: string; customer: string; product: string; lot: string; status: ComplaintStatus; createdAt: string; createdBy: string };
export const customers = [
  { name: 'Atlas Industrial', document: '••.•••.•••/0001', contact: 'contato@atlas.com' },
  { name: 'Orion Peças', document: '••.•••.•••/0001', contact: 'qualidade@orion.com' },
  { name: 'Delta Máquinas', document: '••.•••.•••/0001', contact: 'contato@delta.com' },
];
export const products = [
  { code: 'VX-20', name: 'Válvula VX-20', description: 'Componente industrial' },
  { code: 'C4', name: 'Conector C4', description: 'Conector de linha' },
  { code: 'R9', name: 'Anel R9', description: 'Componente de vedação' },
];
export const lots = [
  { code: 'LOT-2026-014', product: 'Válvula VX-20', manufacturingDate: '12/09/2026' },
  { code: 'LOT-2026-011', product: 'Conector C4', manufacturingDate: '05/09/2026' },
  { code: 'LOT-2026-008', product: 'Anel R9', manufacturingDate: '28/08/2026' },
];
export const initialComplaints: Complaint[] = [
  { id: 'QO-2026-084', title: 'Fissura superficial em peça', description: 'Fissura observada após inspeção visual.', customer: 'Atlas Industrial', product: 'Válvula VX-20', lot: 'LOT-2026-014', status: 'INVESTIGATING', createdAt: '04/10/2026', createdBy: 'Marina Costa' },
  { id: 'QO-2026-079', title: 'Desvio dimensional', description: 'Medida fora da tolerância identificada na inspeção.', customer: 'Orion Peças', product: 'Conector C4', lot: 'LOT-2026-011', status: 'UNDER_ANALYSIS', createdAt: '02/10/2026', createdBy: 'Marina Costa' },
  { id: 'QO-2026-073', title: 'Falha de vedação', description: 'Perda de vedação reportada pelo cliente.', customer: 'Delta Máquinas', product: 'Anel R9', lot: 'LOT-2026-008', status: 'OPEN', createdAt: '28/09/2026', createdBy: 'João Silva' },
];
export const statusLabels: Record<ComplaintStatus, string> = { OPEN: 'Aberta', UNDER_ANALYSIS: 'Em análise', INVESTIGATING: 'Em investigação', RESOLVED: 'Resolvida', CLOSED: 'Fechada' };
