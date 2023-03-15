import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class LinkTo extends Component {
  @service currentUser;

  get route() {
    if (this.currentUser.organization.isSco) {
      return 'authenticated.sco-organization-participants.sco-organization-participant';
    } else if (this.currentUser.organization.isSup) {
      return 'authenticated.sup-organization-participants.sup-organization-participant';
    }
    return 'authenticated.organization-participants.organization-participant';
  }
}
