import Service from '@ember/service';

export default class CampaignStorage extends Service {
  set(campaignCode, key, value) {
    const campaignData = _getCampaignData(campaignCode);
    campaignData[key] = value;
    _setCampaignData(campaignCode, campaignData);
  }

  get(campaignCode, key) {
    const campaignData = _getCampaignData(campaignCode);
    return campaignData[key];
  }

  clear(campaignCode) {
    _setCampaignData(campaignCode, {});
  }

  clearAll() {
    sessionStorage.setItem('campaigns', JSON.stringify({}));
  }
}

function _getCampaignData(campaignCode) {
  const value = sessionStorage.getItem('campaigns');

  const json = value ? JSON.parse(value) : {};

  return json[campaignCode] || {};
}

function _setCampaignData(campaignCode, campaignData) {
  const allCampaignsData = sessionStorage.getItem('campaigns');

  const allCampaignsDataParsed = allCampaignsData ? JSON.parse(allCampaignsData) : {};

  allCampaignsDataParsed[campaignCode] = campaignData;
  sessionStorage.setItem('campaigns', JSON.stringify(allCampaignsDataParsed));
}
