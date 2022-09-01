import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OidcReconciliationComponent extends Component {
  @service oidcIdentityProviders;

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
    return this.args.authenticationMethods.any(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR'
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
  reconcile() {
    // todo
  }
}
