import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class OrganizationCreditInfoComponent extends Component {
    @service currentUser

    get canShowCredit() {
      return this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
    }
}
