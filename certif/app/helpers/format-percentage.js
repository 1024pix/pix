import { helper } from '@ember/component/helper';

export function formatPercentage([value, ..._]) {
  if (value) {
    const percentageValue = value * 100;

    return `${Math.trunc(percentageValue)} %`;
  }
  return '';
}

export default helper(formatPercentage);
