import Route from '@ember/routing/route';

export default class AllTags extends Route {

  async model() {
    const organizationId = this.paramsFor('authenticated.organizations.get').organization_id;

    const organizationTags = this.modelFor('authenticated.organizations.get').tags;
    const allTags = await this.store.findAll('tag');

    return {
      allTags,
      organizationId,
      organizationTags,
    };
  }
}
