import { helper } from '@ember/component/helper';

function formatPercentage([value, ..._]) {
  if (value) {
    return `${Math.trunc(value * 100)} %`;
  }
  return '';
}

export default helper(formatPercentage);
