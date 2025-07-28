import { config } from '../../config.js';
import { LOCALE } from '../../domain/constants.js';
import { getSupportedLocales } from '../../domain/services/locale-service.js';

const PIX_APP_DOMAIN_FR = `${config.domain.pixApp + config.domain.tldFr}`;
const PIX_APP_DOMAIN_ORG = `${config.domain.pixApp + config.domain.tldOrg}`;

/**
 * @param {string} locale
 * @returns {string} - Pix App base URL according the locale
 */
function getPixAppBaseUrl(locale) {
  if (!locale) return PIX_APP_DOMAIN_FR;

  if (locale?.toLocaleLowerCase() === LOCALE.FRENCH_FRANCE) return PIX_APP_DOMAIN_FR;

  if (!getSupportedLocales().includes(locale)) return PIX_APP_DOMAIN_FR;

  return PIX_APP_DOMAIN_ORG;
}

/**
 * @param {string} locale
 * @param {string} redirectUrl - URL to redirect the user to after email validation
 * @param {string} token
 * @returns {string} - generated URL to validate user account email
 */
function getEmailValidationUrl({ locale, redirectUrl, token } = {}) {
  const baseUrl = getPixAppBaseUrl(locale);

  const params = new URLSearchParams();
  if (!token) return redirectUrl;
  params.append('token', token);
  if (redirectUrl) params.append('redirect_url', redirectUrl);

  return `${baseUrl}/api/users/validate-email?${params.toString()}`;
}

/**
 * @typedef UrlBuilder
 */
export const urlBuilder = {
  getEmailValidationUrl,
  getPixAppBaseUrl,
};
