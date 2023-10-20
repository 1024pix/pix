import { helper } from '@ember/component/helper';
import { htmlSafe as emberHtmlSafe } from '@ember/template';

export function htmlSafe(text) {
  return emberHtmlSafe(text);
}
export default helper(htmlSafe);
