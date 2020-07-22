import { helper } from '@ember/component/helper';
import round from 'lodash/round';

export function percentage([ratio]) {
  return round(ratio * 100, 1);
}

export default helper(percentage);
