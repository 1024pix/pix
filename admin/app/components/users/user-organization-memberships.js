import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class UserOrganizationMemberships extends Component {
  @service accessControl;

  get orderedOrganizationMemberships() {
    return this.args.organizationMemberships.sortBy('organizationName');
  }
}
