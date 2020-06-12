import Route from '@ember/routing/route';

export default class OrganizationTargetProfilesRoute extends Route {

  model() {
    return this.modelFor('authenticated.organizations.get');
  }
}
