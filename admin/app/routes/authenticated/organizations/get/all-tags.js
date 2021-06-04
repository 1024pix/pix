import Route from '@ember/routing/route';

export default class AllTags extends Route {

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    const allTags = await this.store.findAll('tag');

    return { organization, allTags };
  }
}
