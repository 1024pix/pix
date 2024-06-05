import Route from '@ember/routing/route';
import RSVP from 'rsvp';
export default class UserProfileRoute extends Route {
  async model() {
    const userProfile = this.modelFor('authenticated.users.get');
    const authenticationMethods = userProfile.authenticationMethods;
    return RSVP.hash({
      userProfile,
      authenticationMethods,
    });
  }
}
