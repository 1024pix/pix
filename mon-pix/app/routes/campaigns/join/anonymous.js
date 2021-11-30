import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class AnonymousRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;
  @service currentUser;

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    await this.session.authenticate('authenticator:anonymous', { campaignCode: campaign.code });
    await this.currentUser.load();
  }
}
