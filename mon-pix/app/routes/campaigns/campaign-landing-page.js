import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class CampaignLandingPageRoute extends Route {
  @service session;

  campaignCode = null;

  deactivate() {
    this.controller.set('isLoading', false);
  }

  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });

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
    return this.get('session.isAuthenticated') === false;
  }
}
