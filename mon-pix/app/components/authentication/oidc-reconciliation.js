import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class OidcReconciliationComponent extends Component {
  @service intl;
  @service oidcIdentityProviders;
  @service session;

  @tracked reconcileErrorMessage = null;
  @tracked isLoading = false;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders[this.args.identityProviderSlug]?.organizationName;
  }

  get shouldShowEmail() {
    return !!this.args.email;
  }

  get shouldShowUsername() {
    return !!this.args.username;
  }

  get shouldShowGarAuthenticationMethod() {
    return this.args.authenticationMethods.some(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR',
    );
  }

  get oidcAuthenticationMethodOrganizationNames() {
    return this.oidcIdentityProviders.getIdentityProviderNamesByAuthenticationMethods(this.args.authenticationMethods);
  }

  @action
  backToLoginOrRegisterForm() {
    this.args.toggleOidcReconciliation();
  }

  @action
  async reconcile() {
    this.isLoading = true;

    try {
      await this.session.authenticate('authenticator:oidc', {
        authenticationKey: this.args.authenticationKey,
        identityProviderSlug: this.args.identityProviderSlug,
        hostSlug: 'user/reconcile',
      });
    } catch (error) {
      const status = get(error, 'errors[0].status');
      const errorsMapping = {
        401: this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key'),
      };
      this.reconcileErrorMessage = errorsMapping[status] || this.intl.t('common.error');
    } finally {
      this.isLoading = false;
    }
  }
}
