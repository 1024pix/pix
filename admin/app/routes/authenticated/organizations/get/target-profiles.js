import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class OrganizationTargetProfilesRoute extends Route {
  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    return RSVP.hash({
      organization: organization,
      targetProfileSummaries: organization.targetProfileSummaries,
    });
  }
}
