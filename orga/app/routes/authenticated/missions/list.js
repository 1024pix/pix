import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionListRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  async model() {
    const organization = this.currentUser.organization;
    return await this.store.findAll('mission', {
      adapterOptions: { organizationId: organization.id },
    });
  }
}
