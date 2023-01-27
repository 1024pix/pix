import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TrainingDetailsRoute extends Route {
  @service store;

  async model() {
    return this.modelFor('authenticated.trainings.training');
  }
}
