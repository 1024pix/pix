import { PixTag } from '@1024pix/nebulix-ember';
import { concat } from '@ember/helper';
import { t } from 'ember-intl';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import ModuleElement from './module-element';

const TAG_COLORS = {
  context: 'purple',
  tip: 'blue-light',
  'further-information': 'blue-light',
  'did-you-know': 'blue-light',
};

export default class ModulixText extends ModuleElement {
  get tagColor() {
    return TAG_COLORS[this.args.text.tag];
  }

  get hasTag() {
    return this.args.text.tag.trim() && this.tagColor !== undefined;
  }

  <template>
    <div class="element-text">
      {{#if this.hasTag}}
        <PixTag @color={{this.tagColor}} class="element-text--with-tag">
          {{t (concat "pages.modulix.elements.text.tag." @text.tag)}}
        </PixTag>
      {{/if}}
      {{htmlUnsafe @text.content}}
    </div>
  </template>
}
