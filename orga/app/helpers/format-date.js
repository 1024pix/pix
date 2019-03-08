import { helper } from '@ember/component/helper';

export function formatDate(params) {
  const monthArray = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sep.', 'oct.', 'nov.', 'dec.'];
  const date = new Date(params[0]);
  return `${date.getDate()} ${monthArray[date.getMonth()]} ${date.getFullYear()}`;
}

export default helper(formatDate);
