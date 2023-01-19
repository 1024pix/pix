import Service, { inject as service } from '@ember/service';
import souris_didacticiel from '../utils/PIX1D/souris/souris-level-1';
import souris_N1 from '../utils/PIX1D/souris/souris-level-2';
import souris_N2 from '../utils/PIX1D/souris/souris-level-3';
import souris_N3 from '../utils/PIX1D/souris/souris-level-4';
import rechercher_didacticiel from '../utils/PIX1D/rechercher/rechercher-level-1';
import rechercher_N1 from '../utils/PIX1D/rechercher/rechercher-level-2';
import rechercher_N2 from '../utils/PIX1D/rechercher/rechercher-level-3';
import rechercher_N3 from '../utils/PIX1D/rechercher/rechercher-level-4';
import gestion_fichier_didacticiel from '../utils/PIX1D/gestion_fichier/fichier-level-1';
import gestion_fichier_N1 from '../utils/PIX1D/gestion_fichier/fichier-level-2';
import gestion_fichier_N2 from '../utils/PIX1D/gestion_fichier/fichier-level-3';
import gestion_fichier_N3 from '../utils/PIX1D/gestion_fichier/fichier-level-4';

export default class Pix1dService extends Service {
  @service router;

  state(campaignCode, masteryPercentage) {
    switch (campaignCode) {
      case 'KLWLLY575':
        return new souris_didacticiel(masteryPercentage);
      case 'NTNSFE441':
        return new souris_N1(masteryPercentage);
      case 'SOURISPAD':
        return new souris_N2(masteryPercentage);
      case 'SBESVL926':
        return new souris_N3(masteryPercentage);
      case 'XGHTSP168':
        return new rechercher_didacticiel(masteryPercentage);
      case 'XVQGBB493':
        return new rechercher_N1(masteryPercentage);
      case 'RECHERCHE':
        return new rechercher_N2(masteryPercentage);
      case 'KGQSRG668':
        return new rechercher_N3(masteryPercentage);
      case 'SDDPGG528':
        return new gestion_fichier_didacticiel(masteryPercentage);
      case 'GRFSLV922':
        return new gestion_fichier_N1(masteryPercentage);
      case 'DOCUMENTS':
        return new gestion_fichier_N2(masteryPercentage);
      case 'GMQFNC812':
        return new gestion_fichier_N3(masteryPercentage);
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
