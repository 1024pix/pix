import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class MembersList extends Component {
  @service currentUser;

  get displayManagingColumn() {
    return this.currentUser.isAdminInOrganization;
  }
}
