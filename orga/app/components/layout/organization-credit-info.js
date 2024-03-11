import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class OrganizationCreditInfoComponent extends Component {
  @service currentUser;

  get canShowCredit() {
    return this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
  }
}
