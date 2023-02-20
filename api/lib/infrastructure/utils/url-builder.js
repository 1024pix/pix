import settings from '../../config';

export default { getCampaignUrl };

function getCampaignUrl(locale, campaignCode) {
  if (!campaignCode) {
    return null;
  }
  if (locale === 'fr') {
    return `${settings.domain.pixApp + settings.domain.tldOrg}/campagnes/${campaignCode}/?lang=fr`;
  }
  if (locale === 'en') {
    return `${settings.domain.pixApp + settings.domain.tldOrg}/campagnes/${campaignCode}/?lang=en`;
  }
  return `${settings.domain.pixApp + settings.domain.tldFr}/campagnes/${campaignCode}`;
}
