import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

@classic
export default class LoginOrRegisterToAccessRestrictedCampaignRoute extends Route.extend(UnauthenticatedRouteMixin) {
  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });
    return campaigns.firstObject;
  }
}
