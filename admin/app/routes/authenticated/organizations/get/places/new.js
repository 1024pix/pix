import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class New extends Route {
  @service accessControl;
  @service store;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isMetier'], 'authenticated');
  }

  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');

    return this.store.createRecord('organization-place', { organizationId: organization.id });
  }
}
