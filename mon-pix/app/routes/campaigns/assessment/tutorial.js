import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TutorialRoute extends Route {
  @service currentUser;
  @service intl;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return {
      campaignCode: this.paramsFor('campaigns').code,
    };
  }
}
