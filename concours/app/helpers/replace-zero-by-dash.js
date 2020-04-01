import { helper } from '@ember/component/helper';

export function replaceZeroByDash(params) {
  const param = params[0];

  return param === 0 ? '–' : param;
}

export default helper(replaceZeroByDash);
