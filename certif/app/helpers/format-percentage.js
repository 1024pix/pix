import { helper } from '@ember/component/helper';

export function formatPercentage([value, ..._]) {
  if (value) {
    return `${truncateDecimalPlaces(value)} %`;
  }
  return '';
}

function truncateDecimalPlaces(value) {
  return Math.trunc(value * 100);
}

export default helper(formatPercentage);
