import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class LinkTo extends Component {
  @service currentUser;

  get route() {
    if (this.currentUser.isSCOManagingStudents) {
      return 'authenticated.sco-organization-participants.sco-organization-participant';
    } else if (this.currentUser.isSUPManagingStudents) {
      return 'authenticated.sup-organization-participants.sup-organization-participant';
    }
    return 'authenticated.organization-participants.organization-participant';
  }
}
