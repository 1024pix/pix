import { oidcProviderRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repositories | OidcProvider', function () {
  describe('#create', function () {
    context('when the OidcProvider doesn’t already exist', function () {
      it('stores an OIDC Provider in the database', async function () {
        // given
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

        // when
        const savedOidcProvider = await oidcProviderRepository.create(oidcProviderProperties);

        // then
        const oidcProvider = await knex('oidc-providers').where({ identityProvider: 'OIDC_EXAMPLE_NET' }).first('id');
        expect(oidcProvider.id).to.equal(savedOidcProvider[0].id);
      });
    });

    context('when the OidcProvider already exists', function () {
      it('throws an AlreadyExistingEntityError', async function () {
        // given
        const buildOidcProviderProperties = {
          accessTokenLifespan: '7d',
          clientId: 'client',
          clientSecret: 'plainTextSecret',
          shouldCloseSession: true,
          identityProvider: 'OIDC_EXAMPLE_NET',
          openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
          organizationName: 'OIDC Example',
          redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
          scope: 'openid profile',
          slug: 'oidc-example-net',
          source: 'oidcexamplenet',
        };
        await databaseBuilder.factory.buildOidcProvider(buildOidcProviderProperties);
        await databaseBuilder.commit();

        // eslint-disable-next-line no-unused-vars
        const { clientSecret, ...oidcProviderProperties } = buildOidcProviderProperties;
        oidcProviderProperties.encryptedClientSecret = '#%@!!!!!!!!!!!!!';

        // when
        const error = await catchErr(oidcProviderRepository.create)(oidcProviderProperties);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });
  });

  describe('#findAllIdentityProviders', function () {
    it('gets all OIDC Providers from the database', async function () {
      // given
      const oidcProvider1Properties = {
        accessTokenLifespan: '7d',
        idTokenLifespan: '7d',
        clientId: 'client',
        clientSecret: '#%@!!!!!!!!!!!!!',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE1',
        openidConfigurationUrl: 'https://oidc.example1.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      };
      const oidcProvider2Properties = {
        accessTokenLifespan: '7d',
        idTokenLifespan: '7d',
        clientId: 'client',
        clientSecret: '#%@????????????????',
        shouldCloseSession: true,
        identityProvider: 'OIDC_EXAMPLE2',
        openidConfigurationUrl: 'https://oidc.example2.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      };
      await databaseBuilder.factory.buildOidcProvider(oidcProvider1Properties);
      await databaseBuilder.factory.buildOidcProvider(oidcProvider2Properties);
      await databaseBuilder.commit();

      // when
      const oidcProviders = await oidcProviderRepository.findAllOidcProviders();

      // then
      expect(oidcProviders.length).to.equal(2);
      const oidcIdentityProviders = oidcProviders.map(({ identityProvider }) => identityProvider);
      expect(oidcIdentityProviders).to.deep.equal(['OIDC_EXAMPLE1', 'OIDC_EXAMPLE2']);
    });
  });
});
