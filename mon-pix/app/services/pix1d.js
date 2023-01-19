import Service, { inject as service } from '@ember/service';
import Module1Level1 from '../utils/PIX1D/module1/campaign-level-1';
import Module1Level2 from '../utils/PIX1D/module1/campaign-level-2';
import Module1Level3 from '../utils/PIX1D/module1/campaign-level-3';
import Module1Level4 from '../utils/PIX1D/module1/campaign-level-4';
import Module2Level1 from '../utils/PIX1D/module2/campaign-level-1';
import Module2Level2 from '../utils/PIX1D/module2/campaign-level-2';
import Module2Level3 from '../utils/PIX1D/module2/campaign-level-3';
import Module2Level4 from '../utils/PIX1D/module2/campaign-level-4';
import Module3Level1 from '../utils/PIX1D/module3/campaign-level-1';
import Module3Level2 from '../utils/PIX1D/module3/campaign-level-2';
import Module3Level3 from '../utils/PIX1D/module3/campaign-level-3';
import Module3Level4 from '../utils/PIX1D/module3/campaign-level-4';

export default class Pix1dService extends Service {
  @service router;

  state(campaignCode, masteryPercentage) {
    switch (campaignCode) {
      case 'KLWLLY575':
        return new Module1Level1(masteryPercentage);
      case 'NTNSFE441':
        return new Module1Level2(masteryPercentage);
      case 'SOURISPAD':
        return new Module1Level3(masteryPercentage);
      case 'SBESVL926':
        return new Module1Level4(masteryPercentage);
      case 'XGHTSP168':
        return new Module2Level1(masteryPercentage);
      case 'XVQGBB493':
        return new Module2Level2(masteryPercentage);
      case 'RECHERCHE':
        return new Module2Level3(masteryPercentage);
      case 'KGQSRG668':
        return new Module2Level4(masteryPercentage);
      case 'SDDPGG528':
        return new Module3Level1(masteryPercentage);
      case 'GRFSLV922':
        return new Module3Level2(masteryPercentage);
      case 'DOCUMENTS':
        return new Module3Level3(masteryPercentage);
      case 'GMQFNC812':
        return new Module3Level4(masteryPercentage);
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
