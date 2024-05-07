import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ActivityRoute extends Route {
  @service store;
  @service router;

  async model() {
    try {
      const organizationLearner = this.modelFor('authenticated.organization-participants.organization-participant');
      const activity = await this.store.queryRecord('organizationLearnerActivity', {
        organizationLearnerId: organizationLearner.id,
      });
      return RSVP.hash({
        organizationLearner,
        organizationLearnerStatistics: activity.organizationLearnerStatistics,
        organizationLearnerParticipations: activity.organizationLearnerParticipations,
      });
    } catch (_) {
      return this.router.replaceWith('authenticated.organization-participants');
    }
  }
}
