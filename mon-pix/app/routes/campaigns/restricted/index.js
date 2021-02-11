import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CampaignsRestrictedIndexRoute extends Route {
  @service session;

  beforeModel(params) {
    if (this.session.isAuthenticated) {
      return this.replaceWith('campaigns.restricted.join', params.code);
    }
    return this.replaceWith('campaigns.restricted.login-or-register-to-access', params.code);
  }

}
