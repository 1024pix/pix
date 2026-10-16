import { action } from '@ember/object';
import { service } from '@ember/service';
import { isTesting } from '@embroider/macros';
import Configuration from 'ember-simple-auth/configuration';
import SessionService from 'ember-simple-auth/services/session';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';
import OAuth2 from 'pix-orga/authenticators/oauth2';
import Oidc from 'pix-orga/authenticators/oidc';
import SessionStore from 'pix-orga/session-stores/application';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service url;
  @service router;

  routeAfterAuthentication = 'authenticated';
  routeAfterInvalidation = null;

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
    super.handleAuthentication(this.routeAfterAuthentication);
  }

  async invalidateWithError(errorCode) {
    this.routeAfterInvalidation = this.router.urlFor('authentication.login', { queryParams: { error: errorCode } });
    await this.invalidate();
  }

  handleInvalidation() {
    this.store.clear();
    super.handleInvalidation(this.routeAfterInvalidation || this.url.homeUrl);
    this.routeAfterInvalidation = null;
  }

  waitBeforeInvalidation(millisecondsToWait) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), millisecondsToWait);
    });
  }

  @action
  updateDataAttribute(attribute, value) {
    this.data[attribute] = value;
  }
}
