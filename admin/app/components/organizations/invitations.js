import Component from '@glimmer/component';

export default class OrganizationInvitations extends Component {
  get sortedInvitations() {
    return this.args.invitations.sortBy('updatedAt').reverse();
  }
}
