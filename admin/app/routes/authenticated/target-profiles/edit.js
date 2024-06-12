import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    const targetProfile = await this.store.findRecord('target-profile', params.target_profile_id, { reload: true });
    const frameworks = await this.store.findAll('framework');

    return { frameworks, targetProfile };
  }
}
