import { helper } from '@ember/component/helper';

export function contains([value, array]) {
  return array.includes(value);
}

export default helper(contains);
