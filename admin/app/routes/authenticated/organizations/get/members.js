import Route from '@ember/routing/route';

export default class OrganizationMembersRoute extends Route {

  model() {
    return this.modelFor('authenticated.organizations.get');
  }
}
