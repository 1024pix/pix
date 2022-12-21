import Service, { inject as service } from '@ember/service';
import CampaignLevel1 from '../utils/PIX1D/campaign-level-1';
import CampaignLevel2 from '../utils/PIX1D/campaign-level-2';

export default class Pix1dService extends Service {
  @service store;
  @service router;

  state(campaignCode, masteryPercentage) {
    switch (campaignCode) {
      case 'MGBFUS272':
        return new CampaignLevel1(masteryPercentage);
      case 'KCJJUL493':
        return new CampaignLevel2(masteryPercentage);
      default:
        return null;
    }
  }
  async transition(campaignCode, masteryPercentage) {
    const state = this.state(campaignCode, masteryPercentage);
    if (state) {
      const nextCampaignCode = state.next();
      this.router.transitionTo('campaigns', nextCampaignCode);
    } else {
      this.router.transitionTo('fill-in-campaign-code');
    }
  }
}
