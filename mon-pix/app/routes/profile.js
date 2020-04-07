import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class ProfileRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  model() {
    return this.currentUser.user;
  }

  async afterModel(user) {
    // This reloads are necessary to keep the ui in sync when the
    // user navigates back to this route
    user.belongsTo('pixScore').reload();
    user.hasMany('scorecards').reload();
    user.hasMany('campaignParticipations').reload();
  }
}
