import { helper } from '@ember/component/helper';

export function formatPercentage([value, ..._]) {
  if (value) {
    const percentageValue = value < 1 ? value * 100 : value;

    return `${Math.trunc(percentageValue)} %`;
  }
  return '';
}

export default helper(formatPercentage);
