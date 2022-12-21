import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RedirectToCampaign extends Route {
  @service pix1d;
  async beforeModel(transition) {
    const { masteryPercentage, campaignCode } = transition.to.queryParams;
    this.pix1d.transition(campaignCode, masteryPercentage);
  }
}
