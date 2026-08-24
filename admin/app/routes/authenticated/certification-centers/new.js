import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NewRoute extends Route {
  @service store;

  queryParams = {
    attachedOrganizationId: { refreshModel: true },
  };

  async model(_, transition) {
    const habilitations = await this.store.findAll('complementary-certification');
    let attachedOrganization = null;
    const { attachedOrganizationId } = transition.to.queryParams;
    if (attachedOrganizationId) {
      attachedOrganization = await this.store.findRecord('organization', attachedOrganizationId);
    }
    return { habilitations, attachedOrganization };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.attachedOrganizationId = null;
    }
  }
}
