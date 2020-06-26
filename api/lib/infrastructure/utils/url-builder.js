const settings = require('../../config');

module.exports = { getCampaignUrl };

function getCampaignUrl(locale, campaignCode) {
  if (!campaignCode) {
    return null;
  }
  const tld = locale === 'fr' ? settings.domain.tldOrg : settings.domain.tldFr;
  return `${settings.domain.pixApp + tld}/campagnes/${campaignCode}`;
}
