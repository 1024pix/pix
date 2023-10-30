import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionsRoute extends Route {
  @service store;
  //TODO rename this service
  @service currentLearner;

  async model() {
    const result = await this.store.findRecord('organization-learner', this.currentLearner.learner.id);
    console.log('resul model', result);
    return result;
  }
}
