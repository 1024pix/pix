import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import * as markdownConverter from '1d/utils/markdown-converter.js';

export default class MarkdownToHtmlUnsafe extends Component {
  get html() {
    const unsafeHtml = markdownConverter.toHTML(this.args.markdown);
    return htmlSafe(unsafeHtml);
  }
}
