import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LoginOrRegisterOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug', 'givenName', 'familyName'];

  @service url;
  @service oidcIdentityProviders;
  @service store;
  @service intl;
  @service locale;
  @service router;
  @service currentDomain;

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

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get selectedLanguage() {
    return this.intl.primaryLocale;
  }

  @action
  onLanguageChange(language) {
    this.locale.setLocale(language);
    this.router.replaceWith('authentication.login-or-register-oidc', { queryParams: { lang: null } });
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
