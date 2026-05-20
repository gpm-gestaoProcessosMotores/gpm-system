import { formatCEP, onlyNumbers } from '../utils/validators.js';

export const cepService = {
  getAddressByCep: async (cep) => {
    const cleanCep = onlyNumbers(cep);
    if (cleanCep.length !== 8) {
      throw new Error('Digite um CEP com 8 números.');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error('Não foi possível buscar o CEP agora.');
    }

    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP não encontrado.');
    }

    return {
      cep: formatCEP(data.cep),
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  },
};
