import Component from '@glimmer/component';

export default class UserOrganizationMemberships extends Component {
  get orderedOrganizationMemberships() {
    return this.args.organizationMemberships.sortBy('organizationName');
  }
}
