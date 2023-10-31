import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionsRoute extends Route {
  @service store;
  //TODO rename this service
  @service currentLearner;

  async model() {
    return await this.store.findRecord('organization-learner', this.currentLearner.learner.id);
  }
}
