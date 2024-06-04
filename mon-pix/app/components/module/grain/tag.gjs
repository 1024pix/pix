import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ModulixGrain extends Component {
  @service intl;

  get typeText() {
    return this.intl.t(`pages.modulix.grain.tag.${this.args.type}`);
  }

  get iconPath() {
    return this.args.type === 'lesson' ? '/images/icons/icon-book.svg' : '/images/icons/icon-cog.svg';
  }

  <template>
    <div class="tag tag--{{@type}}">
      <img src={{this.iconPath}} class="tag_icon" alt="" aria-hidden="true" />
      <span>{{this.typeText}}</span>
    </div>
  </template>
}
