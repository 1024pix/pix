import Route from '@ember/routing/route';

export default class UserProfileRoute extends Route {
  async model() {
    const user = this.modelFor('authenticated.users.get');
    await user.belongsTo('profile').reload();
    return user;
  }
}
