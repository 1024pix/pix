import { PixIcon } from '@1024pix/nebulix-ember';
import { concat } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { SECTION_TITLE_ICONS } from 'mon-pix/models/section';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

export default class ModuleSectionTitle extends Component {
  @service intl;
  @service modulixAutoScroll;

  @action
  sectionTitle(type) {
    return this.intl.t(`pages.modulix.section.${type}`);
  }

  @action
  sectionTitleIcon(type) {
    return SECTION_TITLE_ICONS[type];
  }

  @action
  focusAndScroll(htmlElement) {
    this.modulixAutoScroll.focusAndScroll(htmlElement);
  }

  <template>
    <div
      id={{concat "section_" @sectionType}}
      class="module-preview-passage-content-section"
      {{didInsert this.focusAndScroll}}
    >
      <PixIcon @name={{this.sectionTitleIcon @sectionType}} @ariaHidden={{true}} />
      <h2>{{this.sectionTitle @sectionType}}</h2>
    </div>
  </template>
}
