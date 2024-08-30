import Route from '@ember/routing/route';

export default class UserProfileRoute extends Route {
  async model() {
    const userProfile = this.modelFor('authenticated.users.get');
    return userProfile;
  }
}
