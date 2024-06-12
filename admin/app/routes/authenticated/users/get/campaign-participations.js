import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default class UserProfileRoute extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    await user.hasMany('participations').reload();
    const campaignParticipations = await user.participations;
    return campaignParticipations;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
