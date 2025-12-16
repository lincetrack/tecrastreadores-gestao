export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return cnpj;
};

export const generateWhatsappLink = (phone: string, customerName: string, dueDate: string, valor: number): string => {
  const [year, month] = dueDate.split('-');
  const period = `${month}/${year}`;
  const valorFormatado = formatCurrency(valor);

  const message = `Olá, ${customerName}! Tudo bem? 😊

Passando para lembrar, que a mensalidade do serviço de rastreamento veicular da Tec Rastreadores referente ao período [${period}] está disponível para pagamento.

*Valor: ${valorFormatado}*

Para facilitar, estou enviando o nosso pix.

*CHAVE PIX CELULAR: 47991234391*

Caso necessite de boleto por gentileza nos solicitar o envio.

Se o pagamento já foi realizado, pedimos a gentileza de nos encaminhar o comprovante.

Se precisar de qualquer ajuda ou tiver alguma dúvida, estamos à disposição!

Agradecemos pela parceria e confiança em nossos serviços.
Atenciosamente,
*Equipe Tec Rastreadores*`;

  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
};
