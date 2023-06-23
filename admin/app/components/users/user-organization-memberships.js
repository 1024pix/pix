import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class UserOrganizationMemberships extends Component {
  @service accessControl;

  get orderedOrganizationMemberships() {
    return this.args.organizationMemberships.sortBy('organizationName');
  }
}
