/**
 * Build and manage all Pix application URLs according a locale.
 */

import { config } from '../../../../config/config.js';
import { getDefaultLocale, getNearestSupportedLocale, isFranceLocale } from './locale-service.js';

const PIX_WEBSITE_DOMAIN_FR = `${config.domain.pix}${config.domain.tldFr}`;
const PIX_WEBSITE_DOMAIN_ORG = `${config.domain.pix}${config.domain.tldOrg}`;

// Pix website URLs for each supported locales
export const PIX_WEBSITE_ROOT_URLS = {
  'de-AT': `${PIX_WEBSITE_DOMAIN_ORG}/en`,
  'fr-FR': PIX_WEBSITE_DOMAIN_FR,
  'fr-BE': `${PIX_WEBSITE_DOMAIN_ORG}/fr-be`,
  'nl-BE': `${PIX_WEBSITE_DOMAIN_ORG}/nl-be`,
  nl: `${PIX_WEBSITE_DOMAIN_ORG}/nl-be`,
  en: `${PIX_WEBSITE_DOMAIN_ORG}/en`,
  es: `${PIX_WEBSITE_DOMAIN_ORG}/en`,
  it: `${PIX_WEBSITE_DOMAIN_ORG}/en`,
  'es-419': `${PIX_WEBSITE_DOMAIN_ORG}/en`,
  fr: `${PIX_WEBSITE_DOMAIN_ORG}/fr`,
};

/**
 * @param {string} locale - user locale or a challenge locale
 * @returns {string} - Pix Website URL according the locale
 */
export function getPixWebsiteUrl(locale) {
  const supportedLocale = getNearestSupportedLocale(locale) || getDefaultLocale();
  return PIX_WEBSITE_ROOT_URLS[supportedLocale];
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @returns {string} - Pix Website domain according the locale
 */
export function getPixWebsiteDomain(locale) {
  const websiteUrl = getPixWebsiteUrl(locale);
  const { hostname } = new URL(websiteUrl);

  return hostname;
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @param {Object} options - options for building the URL
 * @param {string} [options.pathname] - optional pathname to append to the URL
 * @param {Object} [options.queryParams] - optional query parameters to append to the URL
 * @param {string} [options.hash] - optional hash to append to the URL
 * @param {boolean} [options.skipLocaleParam] - optional when true, does not automatically add a locale query param
 * @returns {string} - Pix App URL according the locale
 */
export function getPixAppUrl(locale, { pathname, queryParams, hash, skipLocaleParam } = {}) {
  const rootUrl = isFranceLocale(locale)
    ? `${config.domain.pixApp}${config.domain.tldFr}`
    : `${config.domain.pixApp}${config.domain.tldOrg}`;

  return _buildUrlWithLocale({ rootUrl, locale, pathname, queryParams, hash, skipLocaleParam });
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @param {Object} options - options for building the URL
 * @param {string} [options.pathname] - optional pathname to append to the URL
 * @param {Object} [options.queryParams] - optional query parameters to append to the URL
 * @param {string} [options.hash] - optional hash to append to the URL
 * @param {boolean} [options.skipLocaleParam] - optional when true, does not automatically add a locale query param
 * @returns {string} - Pix Orga URL according the locale
 */
export function getPixOrgaUrl(locale, { pathname, queryParams, hash, skipLocaleParam } = {}) {
  const rootUrl = isFranceLocale(locale)
    ? `${config.domain.pixOrga}${config.domain.tldFr}`
    : `${config.domain.pixOrga}${config.domain.tldOrg}`;

  return _buildUrlWithLocale({ rootUrl, locale, pathname, queryParams, hash, skipLocaleParam });
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @param {Object} options - options for building the URL
 * @param {string} [options.pathname] - optional pathname to append to the URL
 * @param {Object} [options.queryParams] - optional query parameters to append to the URL
 * @param {string} [options.hash] - optional hash to append to the URL
 * @param {boolean} [options.skipLocaleParam] - optional when true, does not automatically add a locale query param
 * @returns {string} - Pix Certif URL according the locale
 */
export function getPixCertifUrl(locale, { pathname, queryParams, hash, skipLocaleParam } = {}) {
  const rootUrl = isFranceLocale(locale)
    ? `${config.domain.pixCertif}${config.domain.tldFr}`
    : `${config.domain.pixCertif}${config.domain.tldOrg}`;

  return _buildUrlWithLocale({ rootUrl, locale, pathname, queryParams, hash, skipLocaleParam });
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @returns {string} - Pix App URL according the locale
 */
export function getPixAppConnexionUrl(locale) {
  return getPixAppUrl(locale, { pathname: '/connexion' });
}

/**
 * @param {string} locale - user locale or a challenge locale
 * @param {string} redirectUrl - URL to redirect the user to after email validation
 * @param {string} token - Token used for email validation
 * @returns {string} - generated URL to validate user account email
 */
export function getEmailValidationUrl({ locale, redirectUrl, token } = {}) {
  if (!token) return redirectUrl;

  const queryParams = { token };
  if (redirectUrl) queryParams['redirect_url'] = redirectUrl;

  return getPixAppUrl(locale, { pathname: '/api/users/validate-email', queryParams, skipLocaleParam: true });
}

// Pix website paths for each supported locales
export const PIX_WEBSITE_PATHS = {
  SUPPORT: {
    'de-AT': 'support',
    'fr-FR': 'support',
    'fr-BE': 'support',
    'nl-BE': 'support',
    nl: 'support',
    en: 'support',
    es: 'support',
    'es-419': 'support',
    it: 'support',
    fr: 'support',
  },
};

/**
 * @param {string} locale - user locale or a challenge locale
 * @returns {string} - Pix Support URL according the locale
 */
export function getSupportUrl(locale) {
  const supportedLocale = getNearestSupportedLocale(locale) || getDefaultLocale();
  const websiteRootUrl = getPixWebsiteUrl(supportedLocale);
  return `${websiteRootUrl}/${PIX_WEBSITE_PATHS.SUPPORT[supportedLocale]}`;
}

function _buildUrlWithLocale({ rootUrl, pathname, queryParams, locale, hash, skipLocaleParam } = {}) {
  const url = new URL(rootUrl);

  if (pathname) {
    url.pathname = pathname;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.set(key, value);
    }
  }

  if (hash) {
    url.hash = hash;
  }

  // Adding the "locale" query param on .org domain (except when overriden or skipLocaleParam)
  if (!isFranceLocale(locale) && !(queryParams?.locale || queryParams?.lang) && !skipLocaleParam) {
    const supportedLocale = getNearestSupportedLocale(locale) || getDefaultLocale();
    url.searchParams.set('locale', supportedLocale);
  }

  return url.toString();
}
