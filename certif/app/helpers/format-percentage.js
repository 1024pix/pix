import { helper } from '@ember/component/helper';

export function formatPercentage([value, ..._]) {
  if (value) {
    const percentageValue = Math.round(value * 100);

    return `${percentageValue} %`;
  }
  return '';
}

export default helper(formatPercentage);
