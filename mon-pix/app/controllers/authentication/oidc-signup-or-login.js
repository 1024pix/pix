import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { SessionStorageEntry } from '../../utils/session-storage-entry';

const oidcUserAuthenticationStorage = new SessionStorageEntry('oidcUserAuthentication');

export default class OidcSignupOrLoginController extends Controller {
  queryParams = ['identityProviderSlug'];

  @service url;
  @service oidcIdentityProviders;
  @service store;
  @service router;
  @service currentDomain;

  @tracked showOidcReconciliation = false;
  @tracked identityProviderSlug = null;
  @tracked email = '';
  @tracked fullNameFromPix = '';
  @tracked fullNameFromExternalIdentityProvider = '';
  @tracked username = '';
  @tracked authenticationMethods = [];

  get showcase() {
    return this.url.showcase;
  }

  get oidcUserAuthenticationStorage() {
    return oidcUserAuthenticationStorage.get();
  }

  get userClaims() {
    return this.oidcUserAuthenticationStorage?.userClaims;
  }

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get authenticationKey() {
    return this.oidcUserAuthenticationStorage?.authenticationKey;
  }

  @action toggleOidcReconciliation() {
    this.showOidcReconciliation = !this.showOidcReconciliation;
  }

  @action
  async onLogin({ enteredEmail, enteredPassword }) {
    const identityProvider = this.oidcIdentityProviders[this.identityProviderSlug].code;

    const authenticationRequest = this.store.createRecord('user-oidc-authentication-request', {
      password: enteredPassword,
      email: enteredEmail,
      authenticationKey: this.authenticationKey,
      identityProvider,
    });
    const { email, username, authenticationMethods, fullNameFromPix, fullNameFromExternalIdentityProvider } =
      await authenticationRequest.login();
    this.email = email;
    this.username = username;
    this.authenticationMethods = authenticationMethods;
    this.fullNameFromPix = fullNameFromPix;
    this.fullNameFromExternalIdentityProvider = fullNameFromExternalIdentityProvider;
    this.toggleOidcReconciliation();
  }
}
