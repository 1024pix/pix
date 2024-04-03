import * as oidcProviderRepository from '../../../../../src/authentication/infrastructure/repositories/oidc-provider-repository.js';
import { expect, knex } from '../../../../test-helper.js';

describe('Integration | Authentication | Infrastructure | Repositories | OidcProvider', function () {
  describe('#create', function () {
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
});
