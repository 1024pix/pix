import { service } from '@ember/service';
import { isTesting } from '@embroider/macros';
import { runTask } from 'ember-lifeline';
import Configuration from 'ember-simple-auth/configuration';
import SessionService from 'ember-simple-auth/services/session';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';
import OAuth2 from 'pix-certif/authenticators/oauth2';
import SessionStore from 'pix-certif/session-stores/application';

export default class CurrentSessionService extends SessionService {
  @service currentUser;
  @service featureToggles;

  createConfiguration() {
    return Configuration.load({
      useResolver: false,
    });
  }

  createAuthenticators(owner) {
    return [new OAuth2(owner)];
  }

  createSessionStore(owner) {
    if (isTesting()) {
      return new EphemeralStore(owner);
    }
    return new SessionStore(owner);
  }

  async handleAuthentication() {
    await this.currentUser.load();

    const isCurrentUserMemberOfACertificationCenter =
      this.currentUser.certificationPointOfContact.isMemberOfACertificationCenter;
    const routeAfterAuthentication = isCurrentUserMemberOfACertificationCenter
      ? 'authenticated'
      : 'login-session-invigilator';
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {
    this.store.clear();
    super.handleInvalidation('/connexion');
  }

  waitBeforeInvalidation(millisecondsToWait) {
    return new Promise((resolve) => {
      runTask(this, resolve, millisecondsToWait);
    });
  }

  updateDataAttribute(attribute, value) {
    this.data[attribute] = value;
  }
}
