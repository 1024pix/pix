import { addOidcProvider } from '../../../../../src/authentication/domain/usecases/add-oidc-provider.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Authentication | Domain | UseCases | add-oidc-provider', function () {
  it('creates an OIDC Provider in the oidc-provider-repository', async function () {
    // given
    const domainTransaction = {
      knexTransaction: null,
    };
    const oidcProviderRepository = {
      create: sinon.stub(),
    };
    const oidcProviderProperties = {
      accessTokenLifespan: '7d',
      clientId: 'client',
      encryptedClientSecret: '#%@!!!!!!!!!!!!!',
      shouldCloseSession: true,
      identityProvider: 'OIDC_EXAMPLE_NET',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    const expectedOidcProviderProperties = {
      accessTokenLifespan: '7d',
      additionalRequiredProperties: undefined,
      claimsToStore: undefined,
      clientId: 'client',
      enabled: undefined,
      enabledForPixAdmin: undefined,
      encryptedClientSecret: '#%@!!!!!!!!!!!!!',
      extraAuthorizationUrlParameters: undefined,
      identityProvider: 'OIDC_EXAMPLE_NET',
      openidClientExtraMetadata: undefined,
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      postLogoutRedirectUri: undefined,
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      shouldCloseSession: true,
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };

    // when
    await addOidcProvider({ ...oidcProviderProperties, oidcProviderRepository, domainTransaction });

    // then
    expect(oidcProviderRepository.create).to.have.been.calledWithExactly(expectedOidcProviderProperties, {
      domainTransaction,
    });
  });
});
