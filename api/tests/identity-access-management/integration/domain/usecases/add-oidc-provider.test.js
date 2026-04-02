import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | add-oidc-provider', function () {
  context('when visibility is not specified', function () {
    it('creates an OIDC Provider with visibility set to true', async function () {
      // given
      const oidcProviderProperties = {
        application: 'app',
        applicationTld: '.org',
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

      // when
      await usecases.addOidcProvider(oidcProviderProperties);

      // then
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
      // eslint-disable-next-line no-unused-vars
      const { id, createdAt, updatedAt, encryptedClientSecret, ...oidcProvider } = oidcProviders[0];
      expect(oidcProvider).to.deep.equal({
        isVisible: true,
        accessTokenLifespan: '7d',
        application: 'app',
        applicationTld: '.org',
        clientId: 'client',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE_NET',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
        externalIdentifierClaim: null,
        additionalRequiredProperties: null,
        claimMapping: null,
        claimsToStore: null,
        connectionMethodCode: null,
        enabled: false,
        enabledForPixAdmin: false,
        extraAuthorizationUrlParameters: null,
        logo: null,
        openidClientExtraMetadata: null,
        postLogoutRedirectUri: null,
      });
    });
  });

  context('when visibility is false', function () {
    it('creates an OIDC Provider with visibility set to false', async function () {
      // given
      const oidcProviderProperties = {
        isVisible: false,
        accessTokenLifespan: '7d',
        application: 'app',
        applicationTld: '.org',
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

      // when
      await usecases.addOidcProvider(oidcProviderProperties);

      // then
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
      // eslint-disable-next-line no-unused-vars
      const { id, createdAt, updatedAt, encryptedClientSecret, ...oidcProvider } = oidcProviders[0];
      expect(oidcProvider).to.deep.equal({
        isVisible: false,
        accessTokenLifespan: '7d',
        application: 'app',
        applicationTld: '.org',
        clientId: 'client',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE_NET',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
        externalIdentifierClaim: null,
        additionalRequiredProperties: null,
        claimMapping: null,
        claimsToStore: null,
        connectionMethodCode: null,
        enabled: false,
        enabledForPixAdmin: false,
        extraAuthorizationUrlParameters: null,
        logo: null,
        openidClientExtraMetadata: null,
        postLogoutRedirectUri: null,
      });
    });
  });

  context('connectionMethodCode', function () {
    it('creates an OIDC Provider with a connectionMethodCode', async function () {
      // given
      const oidcProviderProperties = {
        accessTokenLifespan: '7d',
        application: 'orga',
        applicationTld: '.org',
        clientId: 'client',
        clientSecret: 'secret',
        connectionMethodCode: 'OIDC_EXAMPLE_NET',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE_NET-ORGA',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      };

      // when
      await usecases.addOidcProvider(oidcProviderProperties);

      // then
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
      // eslint-disable-next-line no-unused-vars
      const { id, createdAt, updatedAt, encryptedClientSecret, ...oidcProvider } = oidcProviders[0];
      expect(oidcProvider).to.deep.equal({
        isVisible: true,
        accessTokenLifespan: '7d',
        application: 'orga',
        applicationTld: '.org',
        clientId: 'client',
        connectionMethodCode: 'OIDC_EXAMPLE_NET',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE_NET-ORGA',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
        externalIdentifierClaim: null,
        additionalRequiredProperties: null,
        claimMapping: null,
        claimsToStore: null,
        enabled: false,
        enabledForPixAdmin: false,
        extraAuthorizationUrlParameters: null,
        logo: null,
        openidClientExtraMetadata: null,
        postLogoutRedirectUri: null,
      });
    });
  });
});
