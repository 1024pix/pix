import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

@classic
export default class LoginOrRegisterToAccessRestrictedCampaignRoute extends Route.extend(UnauthenticatedRouteMixin) {

  campaignCode = null;

  async beforeModel(transition) {
    this.campaignCode = transition.to.parent.params.campaign_code;
    return super.beforeModel(...arguments);
  }

  async model() {
    const campaigns = await this.store.query('campaign', { filter: { code: this.campaignCode } });
    return campaigns.firstObject;
  }
}
