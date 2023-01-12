import Service, { inject as service } from '@ember/service';
import Module1Level1 from '../utils/PIX1D/module1/campaign-level-1';
import Module1Level2 from '../utils/PIX1D/module1/campaign-level-2';
import Module1Level3 from '../utils/PIX1D/module1/campaign-level-3';
import Module1Level4 from '../utils/PIX1D/module1/campaign-level-4';
import Module2Level1 from '../utils/PIX1D/module2/campaign-level-1';
import Module2Level2 from '../utils/PIX1D/module2/campaign-level-2';
import Module2Level3 from '../utils/PIX1D/module2/campaign-level-3';
import Module2Level4 from '../utils/PIX1D/module2/campaign-level-4';

export default class Pix1dService extends Service {
  @service router;

  state(campaignCode, masteryPercentage) {
    switch (campaignCode) {
      case 'XTBFHW392':
        return new Module1Level1(masteryPercentage);
      case 'EAADBL798':
        return new Module1Level2(masteryPercentage);
      case 'LPLQSP272':
        return new Module1Level3(masteryPercentage);
      case 'CHANGE3':
        return new Module1Level4(masteryPercentage);
      case 'CHANGE4':
        return new Module2Level1(masteryPercentage);
      case 'CHANGE5':
        return new Module2Level2(masteryPercentage);
      case 'CHANGE6':
        return new Module2Level3(masteryPercentage);
      case 'CHANGE7':
        return new Module2Level4(masteryPercentage);
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
