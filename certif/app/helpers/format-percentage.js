import { helper } from '@ember/component/helper';

export default helper(function formatPercentage([value, ..._]) {
  if (value) {
    return `${Math.trunc(value * 100)} %`;
  }
  return '';
});
