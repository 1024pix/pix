import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class ModuleGrainTag extends Component {
  @service intl;

  get typeText() {
    return this.intl.t(`pages.modulix.grain.tag.${this.args.type}`);
  }

  get iconPath() {
    return this.args.type === 'lesson' ? '/images/icons/icon-book.svg' : '/images/icons/icon-cog.svg';
  }
}
