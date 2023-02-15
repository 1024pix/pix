import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditTriggerRoute extends Route {
  @service store;

  async model() {
    const training = this.modelFor('authenticated.trainings.training');
    const frameworks = await this.store.findAll('framework');

    return { training, frameworks };
  }
}
