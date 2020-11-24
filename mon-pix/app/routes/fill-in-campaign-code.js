import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

@classic
export default class FillInCampaignCodeRoute extends Route {

  @service session;

  beforeModel(transition) {
    if (transition.to.queryParams.externalUser) {
      this.session.set('data.externalUser', transition.to.queryParams.externalUser);
    }
  }

  resetController(controller) {
    controller.set('campaignCode', null);
  }
}
