import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class PreselectTargetProfileRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const organization = this.currentUser.organization;
    const frameworks = await this.store.query('framework', {});
    const sortedAreas = frameworks
      .map((framework) => framework.areas.toArray())
      .flat()
      .sortBy('code');
    return {
      organization,
      sortedAreas,
    };
  }
}
