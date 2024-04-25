import Debug from 'debug';

import { disconnect } from '../../db/knex-database-connection.js';
import { learningContentCache as cache } from '../../lib/infrastructure/caches/learning-content-cache.js';
import { temporaryStorage } from '../../lib/infrastructure/temporary-storage/index.js';
import { usecases } from '../../src/authentication/domain/usecases/index.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';

const debugOidcProvidersProperties = Debug('pix:oidc-providers:properties');

const TIMER_NAME = 'load-oidc-providers-from-env-variables';

const OIDC_PROVIDERS_POLE_EMPLOI = {
  identityProvider: 'POLE_EMPLOI',
  organizationName: 'France Travail',
  scope: `application_${process.env.POLE_EMPLOI_CLIENT_ID} api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1`,
  slug: 'pole-emploi',
  source: 'pole_emploi_connect',

  clientId: process.env.POLE_EMPLOI_CLIENT_ID,
  clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,

  accessTokenLifespan: process.env.POLE_EMPLOI_ACCESS_TOKEN_LIFESPAN || '4h',
  enabled: Boolean(process.env.POLE_EMPLOI_ENABLED),
  openidConfigurationUrl: process.env.POLE_EMPLOI_OPENID_CONFIGURATION_URL,
  redirectUri: process.env.POLE_EMPLOI_REDIRECT_URI,
  shouldCloseSession: true,

  openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },

  additionalRequiredProperties: {
    logoutUrl: process.env.POLE_EMPLOI_OIDC_LOGOUT_URL,
    afterLogoutUrl: process.env.POLE_EMPLOI_OIDC_AFTER_LOGOUT_URL,
  },
};
const OIDC_PROVIDERS_FWB = {
  identityProvider: 'FWB',
  organizationName: 'Fédération Wallonie-Bruxelles',
  scope: 'openid profile',
  slug: 'fwb',
  source: 'fwb',

  clientId: process.env.FWB_CLIENT_ID,
  clientSecret: process.env.FWB_CLIENT_SECRET,

  accessTokenLifespan: process.env.FWB_ACCESS_TOKEN_LIFESPAN || '48h',
  claimsToStore: process.env.FWB_CLAIMS_TO_STORE,
  enabled: Boolean(process.env.FWB_ENABLED),
  openidConfigurationUrl: process.env.FWB_OPENID_CONFIGURATION_URL,
  redirectUri: process.env.FWB_REDIRECT_URI,
  shouldCloseSession: true,

  additionalRequiredProperties: {
    logoutUrl: process.env.FWB_OIDC_LOGOUT_URL,
  },

  extraAuthorizationUrlParameters: { acr_values: process.env.FWB_ACR_VALUES },
};
const OIDC_PROVIDERS_CNAV = {
  identityProvider: 'CNAV',
  organizationName: 'CNAV',
  scope: 'openid profile',
  slug: 'cnav',
  source: 'cnav',

  clientId: process.env.CNAV_CLIENT_ID,
  clientSecret: process.env.CNAV_CLIENT_SECRET,

  accessTokenLifespan: process.env.CNAV_ACCESS_TOKEN_LIFESPAN || '48h',
  enabled: Boolean(process.env.CNAV_ENABLED),
  openidConfigurationUrl: process.env.CNAV_OPENID_CONFIGURATION_URL,
  redirectUri: process.env.CNAV_REDIRECT_URI,

  extraAuthorizationUrlParameters: { RedirectToIdentityProvider: 'AD+Authority' },
};
const OIDC_PROVIDERS_PAYSDELALOIRE = {
  identityProvider: 'PAYSDELALOIRE',
  organizationName: 'Pays de la Loire',
  scope: 'openid profile',
  slug: 'pays-de-la-loire',
  source: 'paysdelaloire',

  clientId: process.env.PAYSDELALOIRE_CLIENT_ID,
  clientSecret: process.env.PAYSDELALOIRE_CLIENT_SECRET,

  accessTokenLifespan: process.env.PAYSDELALOIRE_ACCESS_TOKEN_LIFESPAN || '48h',
  enabled: Boolean(process.env.PAYSDELALOIRE_ENABLED),
  openidConfigurationUrl: process.env.PAYSDELALOIRE_OPENID_CONFIGURATION_URL,
  postLogoutRedirectUri: process.env.PAYSDELALOIRE_POST_LOGOUT_REDIRECT_URI,
  redirectUri: process.env.PAYSDELALOIRE_REDIRECT_URI,
  shouldCloseSession: true,
};
const OIDC_PROVIDERS_GOOGLE = {
  identityProvider: 'GOOGLE',
  organizationName: 'Google',
  scope: 'openid profile email',
  slug: 'google',
  source: 'google',

  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  accessTokenLifespan: process.env.GOOGLE_ACCESS_TOKEN_LIFESPAN || '48h',
  claimsToStore: process.env.GOOGLE_CLAIMS_TO_STORE,
  enabled: Boolean(process.env.GOOGLE_ENABLED),
  enabledForPixAdmin: Boolean(process.env.GOOGLE_ENABLED_FOR_PIX_ADMIN),
  openidConfigurationUrl: process.env.GOOGLE_OPENID_CONFIGURATION_URL,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
};

const OIDC_PROVIDERS = [
  OIDC_PROVIDERS_POLE_EMPLOI,
  OIDC_PROVIDERS_FWB,
  OIDC_PROVIDERS_CNAV,
  OIDC_PROVIDERS_PAYSDELALOIRE,
  OIDC_PROVIDERS_GOOGLE,
];

try {
  console.time(TIMER_NAME);
  await main();
  console.log('\noidc-providers table loaded with success\n');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnect();
  await cache.quit();
  await temporaryStorage.quit();
  console.timeEnd(TIMER_NAME);
}

async function main() {
  await DomainTransaction.execute(
    async (domainTransaction) =>
      await Promise.all(
        OIDC_PROVIDERS.map(async (oidcProviderProperties) => {
          console.log(
            `Preparing to create configuration for OIDC Provider "${oidcProviderProperties.identityProvider}"…`,
          );

          debugOidcProvidersProperties(oidcProviderProperties);

          return usecases.addOidcProvider({ ...oidcProviderProperties, domainTransaction });
        }),
      ),
  );
}
