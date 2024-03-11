import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class PreselectTargetProfileRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const organization = this.currentUser.organization;
    const frameworks = await this.store.query('framework', {});
    return {
      organization,
      frameworks,
    };
  }
}
