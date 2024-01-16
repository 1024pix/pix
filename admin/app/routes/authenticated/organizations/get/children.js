import Route from '@ember/routing/route';

export default class AuthenticatedOrganizationsGetChildrenRoute extends Route {
  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    return {
      organizations: organization.children,
    };
  }
}
