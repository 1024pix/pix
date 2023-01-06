import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginOrRegisterOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug', 'givenName', 'familyName'];

  @service url;
  @service oidcIdentityProviders;
  @service store;

  @tracked showOidcReconciliation = false;
  @tracked authenticationKey = null;
  @tracked identityProviderSlug = null;
  @tracked email = '';
  @tracked fullNameFromPix = '';
  @tracked fullNameFromExternalIdentityProvider = '';
  @tracked username = '';
  @tracked authenticationMethods = [];

  get showcase() {
    return this.url.showcase;
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
