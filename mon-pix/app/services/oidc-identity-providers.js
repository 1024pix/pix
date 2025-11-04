import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

// TODO: Manage this through the API
const FR_FEATURED_IDENTITY_PROVIDER_CODE = 'POLE_EMPLOI';
const ORG_FEATURED_IDENTITY_PROVIDER_CODE = 'FWB';
const FEATURED_IDENTITY_PROVIDER_CODES = [FR_FEATURED_IDENTITY_PROVIDER_CODE, ORG_FEATURED_IDENTITY_PROVIDER_CODE];
const FER_IDENTITY_PROVIDER_CODE = 'FER';
const USER_ACCOUNT_RECOVERY_FOR_IDENTITY_PROVIDER_CODES = [FER_IDENTITY_PROVIDER_CODE];

export default class OidcIdentityProviders extends Service {
  @service currentDomain;

  @tracked isOidcProviderAuthenticationInProgress = false;

  identityProviders = [];

  get list() {
    return this.identityProviders;
  }

  getIdentityProviderNamesByAuthenticationMethods(methods) {
    const identityProviderCodes = methods.map(({ identityProvider }) => identityProvider);
    return this.list
      .filter((provider) => identityProviderCodes.includes(provider.code))
      .map((provider) => provider.organizationName);
  }

  get hasIdentityProviders() {
    return this.list.length > 0;
  }

  // TODO: Manage this through the API
  get featuredIdentityProvider() {
    return this.list.find((identityProvider) => {
      const featuredIdentityProviderCode = this.currentDomain.isFranceDomain
        ? FR_FEATURED_IDENTITY_PROVIDER_CODE
        : ORG_FEATURED_IDENTITY_PROVIDER_CODE;

      return identityProvider.code === featuredIdentityProviderCode;
    });
  }

  // TODO: Manage this through the API
  get hasOtherIdentityProviders() {
    if (!this.currentDomain.isFranceDomain) {
      return false;
    }

    return this.list.some((identityProvider) => !FEATURED_IDENTITY_PROVIDER_CODES.includes(identityProvider.code));
  }

  async set(identityProviders) {
    this.identityProviders = identityProviders;
    identityProviders.forEach((identityProvider) => {
      this[identityProvider.id] = identityProvider;
    });
  }

  shouldDisplayAccountRecoveryBanner(identityProviderCode) {
    return USER_ACCOUNT_RECOVERY_FOR_IDENTITY_PROVIDER_CODES.includes(identityProviderCode);
  }
}
