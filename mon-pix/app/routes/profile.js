import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class ProfileRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  model() {
    return this.currentUser.user;
  }

  async afterModel(user) {
    // This reloads are necessary to keep the ui in sync when the
    // user navigates back to this route
    await user.hasMany('scorecards').reload();
    await user.hasMany('campaignParticipations').reload();
  }
}
