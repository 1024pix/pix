import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationInvitations extends Component {
  @service accessControl;

  get sortedInvitations() {
    return this.args.invitations.sortBy('updatedAt').reverse();
  }
}
