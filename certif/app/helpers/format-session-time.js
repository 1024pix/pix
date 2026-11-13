import { helper } from '@ember/component/helper';

export function formatSessionTime([time]) {
  return time?.slice(0, 5) ?? '';
}

export default helper(formatSessionTime);
