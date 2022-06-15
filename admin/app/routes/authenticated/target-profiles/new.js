import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    const targetProfile = await this.store.createRecord('target-profile', { category: 'OTHER' });
    const frameworks = await this.store.findAll('framework');

    return { frameworks, targetProfile };
  }
}
