import { clientService } from './clientService.js';
import { formatCPF, onlyNumbers, validateCPF } from '../utils/validators.js';

export const cpfService = {
  validateCPF: (cpf) => validateCPF(cpf),
  getCpfData: async (cpf) => {
    const cleanCpf = onlyNumbers(cpf);
    const client = clientService.getClients().find((item) => onlyNumbers(item.document) === cleanCpf);

    return {
      document: formatCPF(cleanCpf),
      client: client || null,
      source: client ? 'localStorage' : 'mock-future-api',
    };
  },
};
