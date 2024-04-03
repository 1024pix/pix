import Debug from 'debug';

const debugOidcProvidersSeeds = Debug('pix:oidc-providers:seeds');

export async function buildOidcProviders(databaseBuilder) {
  const oidcProvidersJson = process.env.OIDC_PROVIDERS;
  if (!oidcProvidersJson) {
    debugOidcProvidersSeeds('No environment variable OIDC_PROVIDERS defined, no loading of "oidc-providers" table.');
    return;
  }

  const oidcProviders = JSON.parse(oidcProvidersJson);
  await Promise.all(
    oidcProviders.map(async (oidcProviderPropertiesWithRawClientSecret) => {
      debugOidcProvidersSeeds(
        `Loading configuration for OIDC provider "${oidcProviderPropertiesWithRawClientSecret.identityProvider}"…`,
      );

      return databaseBuilder.factory.buildOidcProvider({ ...oidcProviderPropertiesWithRawClientSecret });
    }),
  );
}
