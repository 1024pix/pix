import { expect } from 'chai';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCases | find-all-oidc-providers', function () {
  it('returns all the oidc providers', async function () {
    // given
    const oidcProvider1Properties = {
      application: 'app',
      applicationTld: '.fr',
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'IDP',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'Idp',
      redirectUri: 'https://app.dev.pix.fr/connexion/idp',
      scope: 'openid profile',
      slug: 'idp',
      source: 'idp',
    };
    await databaseBuilder.factory.buildOidcProvider(oidcProvider1Properties);

    const oidcProvider2Properties = {
      application: 'orga',
      applicationTld: '.fr',
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'IDP_ORGA',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'Idp',
      redirectUri: 'https://orga.dev.pix.fr/connexion/idp',
      scope: 'openid profile',
      slug: 'idp',
      source: 'idp',
    };
    await databaseBuilder.factory.buildOidcProvider(oidcProvider2Properties);
    await databaseBuilder.commit();

    // when
    const result = await usecases.findAllOidcProviders();

    // then
    expect(result).to.have.length(2);
    expect(
      result.map((oidcProvider) => {
        const {
          application,
          applicationTld,
          enabled,
          accessTokenLifespan,
          clientId,
          shouldCloseSession,
          identityProvider,
          openidConfigurationUrl,
          organizationName,
          redirectUri,
          scope,
          slug,
          source,
        } = oidcProvider;
        return {
          application,
          applicationTld,
          enabled,
          accessTokenLifespan,
          clientId,
          shouldCloseSession,
          identityProvider,
          openidConfigurationUrl,
          organizationName,
          redirectUri,
          scope,
          slug,
          source,
        };
      }),
    ).to.have.deep.members([
      {
        application: 'app',
        applicationTld: '.fr',
        enabled: true,
        accessTokenLifespan: '7d',
        clientId: 'client',
        shouldCloseSession: true,
        identityProvider: 'IDP',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'Idp',
        redirectUri: 'https://app.dev.pix.fr/connexion/idp',
        scope: 'openid profile',
        slug: 'idp',
        source: 'idp',
      },
      {
        application: 'orga',
        applicationTld: '.fr',
        enabled: true,
        accessTokenLifespan: '7d',
        clientId: 'client',
        shouldCloseSession: true,
        identityProvider: 'IDP_ORGA',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'Idp',
        redirectUri: 'https://orga.dev.pix.fr/connexion/idp',
        scope: 'openid profile',
        slug: 'idp',
        source: 'idp',
      },
    ]);
  });
});
