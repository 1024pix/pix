import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

export default class LogoutRoute extends Route {
  @service session;
  @service url;
  @service campaignStorage;
  @service router;

  beforeModel() {
    delete this.session.data.externalUser;
    this.campaignStorage.clearAll();

    if (this.session.isAuthenticated) {
      if (this.session.data.authenticated.source === AUTHENTICATED_SOURCE_FROM_MEDIACENTRE) {
        this.session.alternativeRootURL = '/nonconnecte';
      } else if (this.session.data.authenticated.source !== 'pole_emploi_connect') {
        this.session.alternativeRootURL = null;
      }
      return this.session.invalidate();
    }
  }
}
