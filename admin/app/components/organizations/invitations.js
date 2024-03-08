import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class OrganizationInvitations extends Component {
  @service accessControl;

  get sortedInvitations() {
    return this.args.invitations.sortBy('updatedAt').reverse();
  }
}
