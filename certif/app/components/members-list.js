import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class MembersList extends Component {
  @service featureToggles;
  @service currentUser;

  get shouldDisplayRefererColumn() {
    return this.args.hasCleaHabilitation;
  }

  get shouldDisplayManagingColumn() {
    return this.currentUser.isAdminOfCurrentCertificationCenter;
  }
}
