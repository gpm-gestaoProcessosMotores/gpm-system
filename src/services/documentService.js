import { clientService } from './clientService.js';
import { cpfService } from './cpfService.js';
import { formatCEP, formatCNPJ, formatCPF, onlyNumbers, validateCNPJ, validateCPF } from '../utils/validators.js';

export const documentService = {
  formatCPF,
  formatCNPJ,
  validateCPF: (cpf) => ({
    valid: validateCPF(cpf),
    message: validateCPF(cpf) ? 'CPF válido.' : 'CPF inválido.',
  }),
  validateCNPJ: (cnpj) => ({
    valid: validateCNPJ(cnpj),
    message: validateCNPJ(cnpj) ? 'CNPJ válido.' : 'CNPJ inválido.',
  }),
  searchClientByDocument: (document) => {
    const cleanDocument = onlyNumbers(document);
    return clientService.getClients().find((client) => onlyNumbers(client.document) === cleanDocument) || null;
  },
  getCpfData: (cpf) => cpfService.getCpfData(cpf),
  getCnpjData: async (cnpj) => {
    const cleanCnpj = onlyNumbers(cnpj);
    if (!validateCNPJ(cleanCnpj)) {
      throw new Error('CNPJ inválido.');
    }

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    if (!response.ok) {
      throw new Error('CNPJ não encontrado ou serviço indisponível.');
    }

    const data = await response.json();
    const phone = data.ddd_telefone_1 ? String(data.ddd_telefone_1) : '';

    return {
      name: data.razao_social || data.nome_fantasia || '',
      tradeName: data.nome_fantasia || '',
      document: formatCNPJ(cleanCnpj),
      phone: phone ? `(${phone.slice(0, 2)}) ${phone.slice(2)}` : '',
      email: data.email || '',
      cep: formatCEP(data.cep || ''),
      street: data.logradouro || '',
      number: data.numero || '',
      neighborhood: data.bairro || '',
      city: data.municipio || '',
      state: data.uf || '',
      complement: data.complemento || '',
    };
  },
};
