import { config } from '../../config.js';

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
function getEmailValidationUrl({ locale, redirectUri, token }) {
  const baseUrl = `${config.domain.pixApp + (locale ? config.domain.tldOrg : config.domain.tldFr)}`;
  return `${baseUrl}/api/users/validate-email?token=${token}&redirect_uri=${redirectUri}`;
}

/**
 * @typedef UrlBuilder
 */
export const urlBuilder = {
  getCampaignUrl,
  getEmailValidationUrl,
};
