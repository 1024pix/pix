import { service } from '@ember/service';
import { isTesting } from '@embroider/macros';
import Configuration from 'ember-simple-auth/configuration';
import SessionService from 'ember-simple-auth/services/session';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';
import OAuth2 from 'pix-admin/authenticators/oauth2';
import Oidc from 'pix-admin/authenticators/oidc';
import SessionStore from 'pix-admin/session-stores/application';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service router;
  @service url;

  routeAfterAuthentication = 'authenticated';

  createConfiguration() {
    return Configuration.load({
      useResolver: false,
    });
  }

  createAuthenticators(owner) {
    return [new OAuth2(owner), new Oidc(owner)];
  }

  createSessionStore(owner) {
    if (isTesting()) {
      return new EphemeralStore(owner);
    }
    return new SessionStore(owner);
  }

  async handleAuthentication() {
    await this.currentUser.load();
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async handleInvalidation() {
    const routeAfterInvalidation = this._getRouteAfterInvalidation();
    await super.handleInvalidation(routeAfterInvalidation);
  }

  _getRouteAfterInvalidation() {
    const alternativeRootURL = this.alternativeRootURL;
    this.alternativeRootURL = null;

    return alternativeRootURL ? alternativeRootURL : this.url.homeUrl;
  }
}
