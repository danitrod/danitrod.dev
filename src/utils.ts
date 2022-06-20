export const prettyDate = (date: string, lang?: string) => {
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  let day = date.substring(8, 10);
  if (day[0] === '0') {
    day = day.substring(1);
  }

  const months = {
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    pt: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  };

  let prefix;
  switch (day) {
    case '1':
    case '21':
    case '31':
      prefix = 'st';
      break;
    case '2':
    case '22':
      prefix = 'nd';
      break;
    case '3':
    case '23':
      prefix = 'rd';
      break;
    default:
      prefix = 'th';
      break;
  }

  return `${months['en'][parseInt(month) - 1]} ${day}${prefix}, ${year}`;
};
