import { config } from '../../config.js';

export { getCampaignUrl };

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
