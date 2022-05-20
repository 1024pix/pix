import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TubesSelectionRoute extends Route {
  @service store;

  async model() {
    const frameworks = await this.store.findAll('framework');

    return { frameworks };
  }
}
