import { addOidcProvider } from '../../../../../src/identity-access-management/domain/usecases/add-oidc-provider.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | add-oidc-provider', function () {
  it('creates an OIDC Provider in the oidc-provider-repository', async function () {
    // given
    const domainTransaction = {
      knexTransaction: null,
    };
    const oidcProviderRepository = {
      create: sinon.stub(),
    };
    const cryptoService = {
      encrypt: sinon.stub().resolves('#%@!!!!!!!!!!!!!'),
    };
    const addOidcProviderValidator = {
      validate: sinon.stub(),
    };
    const oidcProviderProperties = {
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'secret',
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
    await addOidcProvider({
      ...oidcProviderProperties,
      oidcProviderRepository,
      cryptoService,
      addOidcProviderValidator,
      domainTransaction,
    });

    // then
    expect(addOidcProviderValidator.validate).to.have.been.calledWith({
      accessTokenLifespan: '7d',
      additionalRequiredProperties: undefined,
      claimsToStore: undefined,
      clientId: 'client',
      clientSecret: 'secret',
      enabled: undefined,
      enabledForPixAdmin: undefined,
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
    });
    expect(cryptoService.encrypt).to.have.been.calledWithExactly('secret');
    expect(oidcProviderRepository.create).to.have.been.calledWithExactly(expectedOidcProviderProperties, {
      domainTransaction,
    });
  });
});
