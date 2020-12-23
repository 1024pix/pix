import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class UserDashboard extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  model() {
    return this.currentUser.user;
  }

  async afterModel(user) {
    await user.belongsTo('profile').reload();
    await user.hasMany('campaignParticipations').reload();
    return Promise.all(user.campaignParticipations.map((campaignParticipation) => {
      return campaignParticipation.belongsTo('assessment').reload();
    }));
  }
}
