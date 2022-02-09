import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class PreselectTargetProfileRoute extends Route {
  @service currentUser;

  async model() {
    const organization = this.currentUser.organization;
    const areas = await this.store.query('area', {});
    return {
      organization,
      areas,
    };
  }
}
