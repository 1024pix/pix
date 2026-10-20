import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-orga/config/environment';

export default class LtiCampaignSelectionRoute extends Route {
  @service requestManager;

  async model() {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/lti/campaigns`,
      method: 'GET',
    });

    return response.content;
  }
}
