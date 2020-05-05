import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CampaignLandingPageRoute extends Route {
  @service session;

  deactivate() {
    this.controller.set('isLoading', false);
  }

  async model() {
    const campaignCode = this.paramsFor('campaigns').campaign_code;
    const campaigns = await this.store.query('campaign', { filter: { code: campaignCode } });

    return campaigns.get('firstObject');
  }

  afterModel(campaign) {
    if (campaign.isRestricted && this._userIsUnauthenticated()) {
      return this.replaceWith('campaigns.start-or-resume', campaign.code, {
        queryParams: { campaignIsRestricted: true }
      });
    }
  }

  _userIsUnauthenticated() {
    return this.session.isAuthenticated === false;
  }
}
