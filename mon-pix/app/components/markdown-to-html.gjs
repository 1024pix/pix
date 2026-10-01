import { PixButtonLink } from '@1024pix/nebulix-ember';
import { renderComponent } from '@ember/renderer';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import ENV from 'mon-pix/config/environment';
import showdown from 'showdown';
import xss from 'xss';

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

const replaceLinksFromMarkdown = modifier((element) => {
  element.querySelectorAll('a').forEach((link) => {
    const container = document.createElement('span');
    link.replaceWith(container);
    renderComponent(PixButtonLink, {
      into: container,
      args: { href: link.getAttribute('href'), variant: 'tertiary' },
    });
    container.className = 'link-markdown-to-html';
    const linkInContainer = container.querySelector('a');
    if (link.hasAttribute('rel')) {
      linkInContainer.setAttribute('rel', link.getAttribute('rel'));
    }
    if (link.hasAttribute('target')) {
      linkInContainer.setAttribute('target', link.getAttribute('target'));
    }
    container.querySelector('a').innerHTML = link.innerHTML;
  });
});

export default class MarkdownToHtml extends Component {
  <template>
    {{#if @isInline}}
      {{this.html}}
    {{else if @mustReplaceLinksFromMarkdown}}
      <div class="{{@class}}" ...attributes {{replaceLinksFromMarkdown}}>
        {{this.html}}
      </div>
    {{else}}
      <div class="{{@class}}" ...attributes>
        {{this.html}}
      </div>
    {{/if}}
  </template>
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
      onIgnoreTagAttr: (tag, name, value) => {
        return name === 'class' ? filterAccessibilityClass(value) : null;
      },
    });
    return htmlSafe(html);
  }
}
