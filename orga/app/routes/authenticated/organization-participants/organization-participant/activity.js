import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ActivityRoute extends Route {
  @service store;
  @service router;

  async model() {
    const organizationLearner = this.modelFor('authenticated.organization-participants.organization-participant');
    try {
      return await this.store.queryRecord('organizationLearnerActivity', {
        organizationLearnerId: organizationLearner.id,
      });
    } catch (_) {
      return this.router.replaceWith('authenticated.organization-participants');
    }
  }
}
