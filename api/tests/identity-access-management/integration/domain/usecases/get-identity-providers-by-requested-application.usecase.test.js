import { OidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service.js';
import {
  oidcAuthenticationServiceRegistry,
  usecases,
} from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCases | get-identity-providers-by-requested-application', function () {
  beforeEach(async function () {
    await databaseBuilder.factory.buildOidcProvider({
      application: 'app',
      applicationTld: '.org',
      identityProvider: 'OIDC_PROVIDER_FOR_APP',
      organizationName: 'OIDC Provider For App',
      slug: 'oidc-provider-for-app',
      source: 'oidcProviderForApp',
      enabled: true,
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      accessTokenLifespan: '7d',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
    });

    await databaseBuilder.factory.buildOidcProvider({
      application: 'app',
      applicationTld: '.org',
      identityProvider: 'OIDC_PROVIDER_DISABLED',
      organizationName: 'OIDC Provider Disabled',
      slug: 'oidc-provider-disabled',
      source: 'oidcProviderDisabled',
      enabled: false,
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      accessTokenLifespan: '7d',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
    });

    await databaseBuilder.factory.buildOidcProvider({
      application: 'admin',
      applicationTld: '.fr',
      identityProvider: 'OIDC_PROVIDER_FOR_ADMIN',
      organizationName: 'OIDC Provider For Admin',
      slug: 'oidc-provider-for-admin',
      source: 'oidcProviderForAdmin',
      enabledForPixAdmin: true,
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      accessTokenLifespan: '7d',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      redirectUri: 'https://admin.dev.pix.fr/connexion/oidc-example-net',
      scope: 'openid profile',
    });

    await databaseBuilder.commit();

    await oidcAuthenticationServiceRegistry.testOnly_reset();
  });

  it('returns the ready OIDC Providers for Pix App', async function () {
    // given
    const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });

    // when
    const identityProviders = await usecases.getIdentityProvidersByRequestedApplication({ requestedApplication });

    // then
    expect(identityProviders).to.be.instanceOf(Array);
    expect(identityProviders.length).to.equal(1);

    const returnedIdentityProvider = identityProviders[0];
    expect(returnedIdentityProvider).to.be.instanceOf(OidcAuthenticationService);
    expect(returnedIdentityProvider.identityProvider).to.equal('OIDC_PROVIDER_FOR_APP');
  });

  it('returns the ready OIDC Providers for Pix Admin', async function () {
    // given
    const requestedApplication = new RequestedApplication({ applicationName: 'admin', applicationTld: '.fr' });

    // when
    const identityProviders = await usecases.getIdentityProvidersByRequestedApplication({ requestedApplication });

    // then
    expect(identityProviders).to.be.instanceOf(Array);
    expect(identityProviders.length).to.equal(1);

    const returnedIdentityProvider = identityProviders[0];
    expect(returnedIdentityProvider).to.be.instanceOf(OidcAuthenticationService);
    expect(returnedIdentityProvider.identityProvider).to.equal('OIDC_PROVIDER_FOR_ADMIN');
  });
});
