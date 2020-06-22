const settings = require('../../config');

module.exports = { getCampaignUrl };

function getCampaignUrl(locale, campaignCode) {
  if (!campaignCode) {
    return null;
  }
  const domain = locale === 'fr' ? settings.app.domainOrg : settings.app.domainFr;
  return `https://app.${domain}/campagnes/${campaignCode}`;
}
