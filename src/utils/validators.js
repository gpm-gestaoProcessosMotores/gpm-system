export function onlyNumbers(value) {
  return String(value || '').replace(/\D/g, '');
}

export function formatCPF(value) {
  const digits = onlyNumbers(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validateCPF(value) {
  const cpf = onlyNumbers(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) {
    check = 0;
  }
  if (check !== Number(cpf[9])) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) {
    check = 0;
  }

  return check === Number(cpf[10]);
}

export function formatCNPJ(value) {
  const digits = onlyNumbers(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function validateCNPJ(value) {
  const cnpj = onlyNumbers(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcDigit = (base, weights) => {
    const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const firstDigit = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcDigit(`${cnpj.slice(0, 12)}${firstDigit}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

export function formatCEP(value) {
  return onlyNumbers(value).slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function formatPhone(value) {
  const digits = onlyNumbers(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

export function formatOSCode(value) {
  const rawValue = String(value || '').trim().toUpperCase().replace(/\s/g, '');
  const digits = onlyNumbers(rawValue);
  if (!digits) {
    return rawValue;
  }

  if (/^OS\d+$/.test(rawValue) || /^\d+$/.test(rawValue)) {
    return `OS${digits.padStart(4, '0').slice(-4)}`;
  }

  return rawValue;
}

export function maskDocument(value) {
  const digits = onlyNumbers(value);
  if (digits.length <= 11) {
    const formatted = formatCPF(digits.padStart(11, '0'));
    return formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, '$1.***.***-$4');
  }

  const formatted = formatCNPJ(digits);
  return formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/, '$1.***.***/****-$5');
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
