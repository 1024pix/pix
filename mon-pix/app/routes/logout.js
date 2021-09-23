import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

import get from 'lodash/get';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

export default class LogoutRoute extends Route {
  @service session;
  @service url;
  @service campaignStorage;

  beforeModel() {
    const session = this.session;
    delete session.data.externalUser;
    this.campaignStorage.clearAll();

    if (session.isAuthenticated) {
      if (get(session, 'data.authenticated.id_token')) {
        const { id_token } = session.data.authenticated;
        return session.singleLogout(id_token);
      }

      if (session.data.authenticated.source === AUTHENTICATED_SOURCE_FROM_MEDIACENTRE) {
        session.alternativeRootURL = '/nonconnecte';
      } else {
        session.alternativeRootURL = null;
      }
      return session.invalidate();
    }
  }
}
