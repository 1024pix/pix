import { PixTag } from '@1024pix/nebulix-ember';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { t } from 'ember-intl';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import { defineHighlightedButton, GLOSSARY_WORD_ACTIVATE_EVENT } from './highlighted-button';
import ModuleElement from './module-element';

defineHighlightedButton();

const TAG_COLORS = {
  context: 'purple',
  tip: 'blue-light',
  'further-information': 'blue-light',
  'did-you-know': 'blue-light',
};

export default class ModulixText extends ModuleElement {
  @service modulixGlossaryModal;

  get tagColor() {
    return TAG_COLORS[this.args.text.tag];
  }

  get hasTag() {
    return this.args.text.tag.trim() && this.tagColor !== undefined;
  }

  <template>
    <div class="element-text" {{on GLOSSARY_WORD_ACTIVATE_EVENT this.modulixGlossaryModal.openForWord}}>
      {{#if this.hasTag}}
        <PixTag @color={{this.tagColor}} class="element-text--with-tag">
          {{t (concat "pages.modulix.elements.text.tag." @text.tag)}}
        </PixTag>
      {{/if}}
      {{htmlUnsafe @text.content}}
    </div>
  </template>
}
