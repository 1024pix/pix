import { helper } from '@ember/component/helper';

export function formatDate(params) {
  const value = params[0];
  return value ? (new Date(value)).toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' }) : value;
}

export default helper(formatDate);
