import { helper } from '@ember/component/helper';
import _ from 'lodash';

export function multiply(numbers) {
  return _.reduce(numbers,(a, b) => Number(a) * Number(b));
}

export default helper(multiply);
