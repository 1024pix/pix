import { config } from '../../config.js';
import { LOCALE } from '../../domain/constants.js';

/**
 * @param {string} locale
 * @returns {string} - Pix App base URL according the locale
 */
function getPixAppBaseUrl(locale) {
  if (!locale) return `${config.domain.pixApp + config.domain.tldFr}`;

  if (locale?.toLocaleLowerCase() === LOCALE.FRENCH_FRANCE) return `${config.domain.pixApp + config.domain.tldFr}`;

  if (!Object.values(LOCALE).includes(locale)) return `${config.domain.pixApp + config.domain.tldFr}`;

  return `${config.domain.pixApp + config.domain.tldOrg}`;
}

function getCampaignUrl(locale, campaignCode) {
  if (!campaignCode) {
    return null;
  }
  if (locale === 'fr') {
    return `${config.domain.pixApp + config.domain.tldOrg}/campagnes/${campaignCode}/?lang=fr`;
  }
  if (locale === 'en') {
    return `${config.domain.pixApp + config.domain.tldOrg}/campagnes/${campaignCode}/?lang=en`;
  }
  return `${config.domain.pixApp + config.domain.tldFr}/campagnes/${campaignCode}`;
}

/**
 * @param {string} locale
 * @param {string} redirectUri - URL to redirect the user to after email validation
 * @param {string} token
 * @returns {string} - generated URL to validate user account email
 */
function getEmailValidationUrl({ locale, redirectUri, token } = {}) {
  const baseUrl = getPixAppBaseUrl(locale);

  const params = new URLSearchParams();
  if (token) params.append('token', token);
  if (redirectUri) params.append('redirect_uri', redirectUri);

  return `${baseUrl}/api/users/validate-email?${params.toString()}`;
}

/**
 * @typedef UrlBuilder
 */
export const urlBuilder = {
  getCampaignUrl,
  getEmailValidationUrl,
  getPixAppBaseUrl,
};
