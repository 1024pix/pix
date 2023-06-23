import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class OrganizationInvitations extends Component {
  @service accessControl;

  get sortedInvitations() {
    return this.args.invitations.sortBy('updatedAt').reverse();
  }
}
