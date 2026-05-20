import { documentService } from './documentService.js';

export const cnpjService = {
  getCnpjData: (cnpj) => documentService.getCnpjData(cnpj),
};
