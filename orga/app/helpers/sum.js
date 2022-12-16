import { helper } from '@ember/component/helper';
import reduce from 'lodash/reduce';

export function sum(numbers) {
  return reduce(numbers, (a, b) => Number(a) + Number(b));
}

export default helper(sum);
