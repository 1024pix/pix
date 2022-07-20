import Route from '@ember/routing/route';

export default class UserProfileRoute extends Route {
  async model() {
    return this.modelFor('authenticated.users.get');
  }
}
