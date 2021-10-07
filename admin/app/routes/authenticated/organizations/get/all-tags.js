import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AllTags extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    const allTags = await this.store.findAll('tag');

    return { organization, allTags };
  }
}
