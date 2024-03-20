import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class ModuleGrainTag extends Component {
  @service intl;

  get typeText() {
    return this.intl.t(`pages.modulix.grain.tag.${this.args.type}`);
  }
}
