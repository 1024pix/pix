import Component from '@glimmer/component';
import showdown from 'showdown';
import xss from 'xss';
import { htmlSafe } from '@ember/template';

function modifyWhiteList() {
  return {
    ...xss.whiteList,
    style: [],
    span: ['style'],
    th: ['style'],
    td: ['style'],
    tr: ['style'],
    table: ['style'],
    a: ['href', 'rel', 'target', 'title'],
  };
}

function filterAccessibilityClass(value) {
  return value === 'sr-only' ? `class="${value}"` : null;
}

export default class MarkdownToHtml extends Component {
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
    const html = xss(unsafeHtml, {
      whiteList: modifyWhiteList(),
      onIgnoreTagAttr: (tag, name, value) => {
        return name === 'class' ? filterAccessibilityClass(value) : null;
      },
    });
    return htmlSafe(html);
  }
}
