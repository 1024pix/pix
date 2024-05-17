import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionListRoute extends Route {
  @service currentUser;
  @service url;
  @service router;
  @service store;

  async beforeModel() {
    await this.currentUser.load();
  }
  async model() {
    const pixJuniorSchoolUrl = this.url.pixJuniorSchoolUrl;
    const organization = this.currentUser.organization;
    const isAdminOfTheCurrentOrganization = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const missions = await this.store.findAll('mission', {
      adapterOptions: { organizationId: organization.id },
    });
    return {
      pixJuniorSchoolUrl,
      missions,
      isAdminOfTheCurrentOrganization,
    };
  }
}
