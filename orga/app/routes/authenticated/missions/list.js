import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class MissionListRoute extends Route {
  @service currentUser;
  @service url;
  @service router;
  @service store;

  async model() {
    const pixJuniorSchoolUrl = this.url.pixJuniorSchoolUrl;
    const organization = this.currentUser.organization;
    const isAdminOfTheCurrentOrganization = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const missions = this.store.findAll('mission', {
      adapterOptions: { organizationId: organization.id },
    });
    return RSVP.hash({
      pixJuniorSchoolUrl,
      missions,
      isAdminOfTheCurrentOrganization,
    });
  }
}
