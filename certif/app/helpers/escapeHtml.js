import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

function escapeHtml(htmlContent) {
  return htmlSafe(htmlContent);
}

export default helper(escapeHtml);
