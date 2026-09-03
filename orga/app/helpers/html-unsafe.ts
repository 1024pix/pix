import { helper } from '@ember/component/helper';
import type { SafeString } from '@ember/template';
import { htmlSafe as emberHtmlUnsafe } from '@ember/template';

export function htmlUnsafe([text]: [string]): SafeString {
  return emberHtmlUnsafe(text);
}

export default helper(htmlUnsafe);
