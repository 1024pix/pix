import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import showdown from 'showdown';

export default class MarkdownToHtmlUnsafe extends Component {
  get options() {
    return {
      ...ENV.showdown,
      extensions: this.args.extensions ? this.args.extensions.split(' ') : [],
    };
  }

  get html() {
    const converter = new showdown.Converter(this.options);
    const unsafeHtml = converter.makeHtml(this.args.markdown);
    return htmlSafe(unsafeHtml);
  }
}
