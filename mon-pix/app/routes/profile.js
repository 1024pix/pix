import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import KeycloakAuthenticatedRouteMixin from 'ember-keycloak-auth/mixins/keycloak-authenticated-route';
import Route from '@ember/routing/route';

@classic
export default class ProfileRoute extends Route.extend(KeycloakAuthenticatedRouteMixin) {
  @service currentUser;

  model() {
    return this.currentUser.user;
  }

  async afterModel(user) {
    // This reloads are necessary to keep the ui in sync when the
    // user navigates back to this route
    user.belongsTo('profile').reload();
    user.hasMany('campaignParticipations').reload();
  }
}
