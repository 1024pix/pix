import Component from '@glimmer/component';
import showdown from 'showdown';
import { htmlSafe } from '@ember/template';

export default class MarkdownToHtmlUnsafe extends Component {
  get options() {
    return {
      openLinksInNewWindow: true,
      strikethrough: true,
      extensions: this.args.extensions ? this.args.extensions.split(' ') : [],
    };
  }

  get html() {
    const converter = new showdown.Converter(this.options);
    const unsafeHtml = converter.makeHtml(this.args.markdown);
    return htmlSafe(unsafeHtml);
  }
}
