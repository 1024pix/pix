import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IdentityProviders from 'mon-pix/identity-providers';

export default class LoginOrRegisterOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug'];

  @service url;
  @tracked showOidcReconciliation = false;
  @tracked authenticationKey = null;
  @tracked identityProviderSlug = null;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action toggleOidcReconciliation() {
    this.showOidcReconciliation = !this.showOidcReconciliation;
  }

  @action
  async onLogin({ enteredEmail, enteredPassword }) {
    const identityProvider = IdentityProviders[this.identityProviderSlug]?.code;

    const authenticationRequest = this.store.createRecord('user-oidc-authentication-request', {
      password: enteredPassword,
      email: enteredEmail,
      authenticationKey: this.authenticationKey,
      identityProvider,
    });
    await authenticationRequest.login();
    this.toggleOidcReconciliation();
  }
}
