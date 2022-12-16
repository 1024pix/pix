import { helper } from '@ember/component/helper';

export function join([values, separator]) {
  return values.join(separator);
}

export default helper(join);
