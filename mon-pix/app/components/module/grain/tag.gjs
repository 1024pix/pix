import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ModulixGrainTag extends Component {
  @service intl;

  get typeText() {
    return this.intl.t(`pages.modulix.grain.tag.${this.args.type}`);
  }

  get iconPath() {
    switch (this.args.type) {
      case 'lesson':
        return '/images/icons/icon-book.svg';
      case 'activity':
        return '/images/icons/icon-cog.svg';
      case 'discovery':
        return '/images/icons/icon-door-open.svg';
      case 'challenge':
        return '/images/icons/icon-cognition.svg';
      case 'summary':
        return '/images/icons/icon-mountain.svg';
      default:
        return '/images/icons/icon-book.svg';
    }
  }

  <template>
    <div class="tag tag--{{@type}}">
      <img src={{this.iconPath}} class="tag_icon" alt="" aria-hidden="true" />
      <span>{{this.typeText}}</span>
    </div>
  </template>
}
