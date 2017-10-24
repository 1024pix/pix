import { helper } from '@ember/component/helper';

export function inc(params) {
  return params[0] + 1;
}

export default helper(inc);
