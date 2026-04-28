import { findOidcProviderClaims } from '../../../../../src/maddo/infrastructure/repositories/oidc-provider-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | oidc-providers', function () {
  describe('findOidcProviderClaims', function () {
    it('returns claims of an oidc provider', async function () {
      // given
      const oidcProvider = await databaseBuilder.factory.buildOidcProvider({
        identityProvider: 'IDENTITY_PROVIDER_EXAMPLE',
        claimsToStore: 'employeeNumber,population',
        accessTokenLifespan: '7d',
        clientId: 'client',
        clientSecret: 'plainTextSecret',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'Identity Provider Example',
        redirectUri: 'https://orga.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile campaigns',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      });
      await databaseBuilder.commit();

      // when
      const claims = await findOidcProviderClaims(oidcProvider.identityProvider);

      // then
      expect(claims).to.deep.equals(['employeeNumber', 'population']);
    });

    context('when no claims to store', function () {
      it('returns an empty array', async function () {
        // given
        const oidcProvider = await databaseBuilder.factory.buildOidcProvider({
          identityProvider: 'IDENTITY_PROVIDER_EXAMPLE',
          accessTokenLifespan: '7d',
          clientId: 'client',
          clientSecret: 'plainTextSecret',
          openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
          organizationName: 'Identity Provider Example',
          redirectUri: 'https://orga.dev.pix.org/connexion/oidc-example-net',
          scope: 'openid profile campaigns',
          slug: 'oidc-example-net',
          source: 'oidcexamplenet',
        });
        await databaseBuilder.commit();

        // when
        const claims = await findOidcProviderClaims(oidcProvider.identityProvider);

        // then
        expect(claims).to.deep.equals([]);
      });
    });

    context('when oidc provider not found', function () {
      it('returns an empty array', async function () {
        // when
        const claims = await findOidcProviderClaims('xxx');

        // then
        expect(claims).to.deep.equals([]);
      });
    });
  });
});
