import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

// TODO: Manage this through the API
const FR_FEATURED_IDENTITY_PROVIDER_CODE = 'POLE_EMPLOI';
const ORG_FEATURED_IDENTITY_PROVIDER_CODE = 'FWB';
const FEATURED_IDENTITY_PROVIDER_CODES = [FR_FEATURED_IDENTITY_PROVIDER_CODE, ORG_FEATURED_IDENTITY_PROVIDER_CODE];
const FER_IDENTITY_PROVIDER_CODE = 'FER';
const USER_ACCOUNT_RECOVERY_FOR_IDENTITY_PROVIDER_CODES = [FER_IDENTITY_PROVIDER_CODE];

export default class OidcIdentityProviders extends Service {
  @service store;
  @service currentDomain;

  @tracked isOidcProviderAuthenticationInProgress = false;

  async load() {
    await this.store.findAll('oidc-identity-provider');
  }

  get list() {
    return this.store.peekAll('oidc-identity-provider');
  }

  get visibleIdentityProviders() {
    return this.list.filter((identityProvider) => identityProvider.isVisible);
  }

  get hasVisibleIdentityProviders() {
    return this.visibleIdentityProviders.length > 0;
  }

  findByCode(identityProviderCode) {
    return this.list.find((oidcProvider) => oidcProvider.code === identityProviderCode);
  }

  findBySlug(identityProviderSlug) {
    return this.list.find((oidcProvider) => oidcProvider.slug === identityProviderSlug);
  }

  getIdentityProviderNamesByAuthenticationMethods(methods) {
    const identityProviderCodes = methods.map(({ identityProvider }) => identityProvider);
    return this.list
      .filter((provider) => identityProviderCodes.includes(provider.code))
      .map((provider) => provider.organizationName);
  }

  // TODO: Manage this through the API
  get featuredIdentityProvider() {
    return this.visibleIdentityProviders.find((identityProvider) => {
      const featuredIdentityProviderCode = this.currentDomain.isFranceDomain
        ? FR_FEATURED_IDENTITY_PROVIDER_CODE
        : ORG_FEATURED_IDENTITY_PROVIDER_CODE;

      return identityProvider.code === featuredIdentityProviderCode;
    });
  }

  get hasOtherIdentityProviders() {
    return this.visibleIdentityProviders.some(
      (identityProvider) => !FEATURED_IDENTITY_PROVIDER_CODES.includes(identityProvider.code),
    );
  }

  shouldDisplayAccountRecoveryBanner(identityProviderCode) {
    return USER_ACCOUNT_RECOVERY_FOR_IDENTITY_PROVIDER_CODES.includes(identityProviderCode);
  }
}
