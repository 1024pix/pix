import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ActivityRoute extends Route {
  @service store;
  @service router;

  async model() {
    const organizationLearner = this.modelFor(
      'authenticated.sco-organization-participants.sco-organization-participant'
    );
    try {
      return RSVP.hash({
        organizationLearner,
        activity: await this.store.queryRecord('organizationLearnerActivity', {
          organizationLearnerId: organizationLearner.id,
        }),
      });
    } catch (_) {
      return this.router.replaceWith('authenticated.sco-organization-participants');
    }
  }
}
