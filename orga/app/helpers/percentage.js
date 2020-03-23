import { helper } from '@ember/component/helper';
import _ from 'lodash';

export function percentage([ratio]) {
  return _.round(ratio * 100, 1);
}

export default helper(percentage);
