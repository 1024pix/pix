import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import showdown from 'showdown';
import xss from 'xss';

const xssWhitelist = {
  ...xss.whiteList,
  style: [],
  span: ['style'],
  th: ['style'],
  td: ['style'],
  tr: ['style'],
  table: ['style'],
  a: ['href', 'rel', 'target', 'title'],
};

const showdownOptions = {
  openLinksInNewWindow: true,
  strikethrough: true,
};

export default class SafeMarkdownToHtml extends Component {
  toHtml(markdown) {
    const converter = new showdown.Converter(showdownOptions);
    const unsafeHtml = converter.makeHtml(markdown);
    const html = xss(unsafeHtml, {
      whiteList: xssWhitelist,
    });
    return htmlSafe(html);
  }
}
