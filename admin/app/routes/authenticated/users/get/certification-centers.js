import Route from '@ember/routing/route';

export default class UserCertificationCentersRoute extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    return user;
  }
}
