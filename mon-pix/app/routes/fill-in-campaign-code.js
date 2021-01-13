import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FillInCampaignCodeRoute extends Route {

  @service session;

  beforeModel(transition) {
    if (transition.to.queryParams.externalUser) {
      this.session.data.externalUser = transition.to.queryParams.externalUser;
    }
  }

  resetController(controller) {
    controller.campaignCode = null;
  }
}
