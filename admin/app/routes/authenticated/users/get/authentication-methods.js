import Route from '@ember/routing/route';

export default class UserAuthenticationMethodsRoute extends Route {
  async model() {
    const userProfile = this.modelFor('authenticated.users.get');
    const authenticationMethods = await userProfile.authenticationMethods;
    return {
      userProfile,
      authenticationMethods,
    };
  }
}
