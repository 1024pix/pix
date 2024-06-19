import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ActivityRoute extends Route {
  @service store;
  @service router;

  async model() {
    const { organizationLearner } = this.modelFor(
      'authenticated.sco-organization-participants.sco-organization-participant',
    );
    try {
      return RSVP.hash({
        organizationLearner,
        activity: await this.store.queryRecord('organization-learner-activity', {
          organizationLearnerId: organizationLearner.id,
        }),
      });
    } catch (_) {
      return this.router.replaceWith('authenticated.sco-organization-participants');
    }
  }
}
