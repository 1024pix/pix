import Debug from 'debug';

import { OIDC_PROVIDER_EXAMPLE_NET_IDENTITY_PROVIDER } from './constants.js';

const debugOidcProvidersSeeds = Debug('pix:oidc-providers:seeds');

const defaultVisibleOidcProviderProperties = {
  accessTokenLifespan: '48h',
  scope: 'openid profile',
  enabled: true,
};

const defaultNotVisibleOidcProviderProperties = Object.assign(
  {
    isVisible: false,
  },
  defaultVisibleOidcProviderProperties,
);

export async function buildOidcProviders(databaseBuilder) {
  await _buildVisibleOidcProviders(databaseBuilder);
  await _buildNotVisibleOidcProviders(databaseBuilder);
  await _buildOidcProvidersFromEnv(databaseBuilder);
}

async function _buildVisibleOidcProviders(databaseBuilder) {
  await databaseBuilder.factory.buildOidcProvider(
    Object.assign(
      {
        application: 'app',
        applicationTld: '.fr',
        identityProvider: OIDC_PROVIDER_EXAMPLE_NET_IDENTITY_PROVIDER,
        organizationName: 'OIDC Example 1 from seeds',
        slug: 'seeds-1-oidc-example-net',
        source: 'seeds-1-oidc-example-net',
        clientId: '1-XXX',
        clientSecret: '1-YYY',
        openidConfigurationUrl: 'https://seeds-1.oidc.example.net/.well-known/openid-configuration',
        redirectUri: 'https://app.dev.pix.org/connexion/seeds-1-oidc-example-net',
      },
      defaultVisibleOidcProviderProperties,
    ),
  );

  await databaseBuilder.factory.buildOidcProvider(
    Object.assign(
      {
        application: 'app',
        applicationTld: '.fr',
        identityProvider: 'OIDC_EXAMPLE_NET_FROM_SEEDS-2',
        organizationName: 'OIDC Example 2 from seeds',
        slug: 'seeds-2-oidc-example-net',
        source: 'seeds-2-oidc-example-net',
        clientId: '2-XXX',
        clientSecret: '2-YYY',
        openidConfigurationUrl: 'https://seeds-2.oidc.example.net/.well-known/openid-configuration',
        redirectUri: 'https://app.dev.pix.org/connexion/seeds-2-oidc-example-net',
      },
      defaultVisibleOidcProviderProperties,
    ),
  );

  await databaseBuilder.factory.buildOidcProvider(
    Object.assign(
      {
        application: 'orga',
        applicationTld: '.org',
        identityProvider: 'OIDC_EXAMPLE_NET_FROM_SEEDS-2-ORGA',
        organizationName: 'OIDC Example 2 from seeds',
        slug: 'seeds-2-oidc-example-net',
        source: 'seeds-2-oidc-example-net',
        clientId: '2-XXX',
        clientSecret: '2-YYY',
        connectionMethodCode: 'OIDC_EXAMPLE_NET_FROM_SEEDS-2',
        openidConfigurationUrl: 'https://seeds-2.oidc.example.net/.well-known/openid-configuration',
        redirectUri: 'https://app.dev.pix.org/connexion/seeds-2-oidc-example-net',
      },
      defaultVisibleOidcProviderProperties,
    ),
  );
}

async function _buildNotVisibleOidcProviders(databaseBuilder) {
  await databaseBuilder.factory.buildOidcProvider(
    Object.assign(
      {
        application: 'app',
        applicationTld: '.fr',
        identityProvider: 'OIDC_EXAMPLE_NET_NOT_VISIBLE_FROM_SEEDS-1',
        organizationName: 'OIDC Example not visible 1 from seeds',
        slug: 'seeds-not-visible-1-oidc-example-net',
        source: 'seeds-not-visible-1-oidc-example-net',
        clientId: 'not-visible-1-XXX',
        clientSecret: 'not-visible-1-YYY',
        openidConfigurationUrl: 'https://seeds-not-visible-1.oidc.example.net/.well-known/openid-configuration',
        redirectUri: 'https://app.dev.pix.org/connexion/seeds-not-visible-1-oidc-example-net',
      },
      defaultNotVisibleOidcProviderProperties,
    ),
  );

  await databaseBuilder.factory.buildOidcProvider(
    Object.assign(
      {
        application: 'app',
        applicationTld: '.fr',
        identityProvider: 'OIDC_EXAMPLE_NET_NOT_VISIBLE_FROM_SEEDS-2',
        organizationName: 'OIDC Example not visible 2 from seeds',
        slug: 'seeds-not-visible-2-oidc-example-net',
        source: 'seeds-not-visible-2-oidc-example-net',
        clientId: 'not-visible-2-XXX',
        clientSecret: 'not-visible-2-YYY',
        openidConfigurationUrl: 'https://seeds-not-visible-2.oidc.example.net/.well-known/openid-configuration',
        redirectUri: 'https://app.dev.pix.org/connexion/seeds-not-visible-2-oidc-example-net',
      },
      defaultNotVisibleOidcProviderProperties,
    ),
  );
}

async function _buildOidcProvidersFromEnv(databaseBuilder) {
  // eslint-disable-next-line n/no-process-env
  const oidcProvidersJson = process.env.OIDC_PROVIDERS;
  if (!oidcProvidersJson) {
    debugOidcProvidersSeeds('No environment variable OIDC_PROVIDERS defined, no loading from environment.');
    return;
  }

  const oidcProviders = JSON.parse(oidcProvidersJson);

  for (const oidcProviderProperties of oidcProviders) {
    debugOidcProvidersSeeds(`Loading configuration for OIDC provider "${oidcProviderProperties.identityProvider}"…`);
    await databaseBuilder.factory.buildOidcProvider(oidcProviderProperties);
  }
}
