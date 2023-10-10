import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class MembersList extends Component {
  @service featureToggles;

  get shouldDisplayRefererColumn() {
    return this.args.hasCleaHabilitation;
  }
}
