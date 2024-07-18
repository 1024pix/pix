import { helper } from '@ember/component/helper';
import { htmlSafe as emberHtmlUnsafe } from '@ember/template';

export function htmlUnsafe(text) {
  return emberHtmlUnsafe(text);
}
export default helper(htmlUnsafe);
