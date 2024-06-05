import Route from '@ember/routing/route';

export default class UserOrganizationsRoute extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    const organizationMemberships = await user.organizationMemberships;
    return organizationMemberships;
  }
}
