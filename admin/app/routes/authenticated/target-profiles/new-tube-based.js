import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewTubeBasedRoute extends Route {
  @service store;

  async model() {
    const targetProfile = this.store.createRecord('target-profile', { category: 'OTHER' });
    const frameworks = await this.store.findAll('framework');

    return { targetProfile, frameworks };
  }
}
