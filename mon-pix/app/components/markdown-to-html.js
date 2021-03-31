import Component from '@glimmer/component';
import showdown from 'showdown';
import xss from 'xss';
import { htmlSafe } from '@ember/string';
import ENV from 'mon-pix/config/environment';

function modifyWhiteList() {
  return {
    ...xss.whiteList,
    a: ['href', 'rel', 'target', 'title'],
  };
}

export default class MarkdownToHtml extends Component {
  get options() {
    return {
      ...ENV.showdown,
      extensions: this.args.extensions ? this.args.extensions.split(' ') : [],
    };
  }

  get html() {
    const converter = new showdown.Converter(this.options);
    const unsafeHtml = converter.makeHtml(this.args.markdown);
    const html = xss(unsafeHtml, {
      whiteList: modifyWhiteList(),
    });
    return htmlSafe(html);
  }
}
