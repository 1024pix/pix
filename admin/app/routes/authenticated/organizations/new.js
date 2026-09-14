import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NewRoute extends Route {
  @service router;
  @service store;
  @service accessControl;

  queryParams = {
    parentOrganizationId: { refreshModel: true },
  };

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(_, transition) {
    const administrationTeams = await this.store.findAll('administration-team');
    const countries = await this.store.findAll('country');
    const organizationLearnerTypes = await this.store.findAll('organization-learner-type');
    let parentOrganization = null;
    const { parentOrganizationId } = transition.to.queryParams;
    if (parentOrganizationId) {
      parentOrganization = await this.store.findRecord('organization', parentOrganizationId);
    }
    const structureCategories = await this.store.findAll('structure-category');

    return {
      administrationTeams,
      countries,
      parentOrganization,
      organizationLearnerTypes,
      structureCategories,
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.parentOrganizationId = null;
    }
  }
}
