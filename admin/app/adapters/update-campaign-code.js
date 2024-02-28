import ApplicationAdapter from './application';

export default class UpdateCampaignCode extends ApplicationAdapter {
  updateCampaignCode({ campaignId, campaignCode }) {
    const url = `${this.host}/${this.namespace}/admin/campaigns/${campaignId}/update-code`;

    return this.ajax(url, 'PATCH', { data: { campaignCode } });
  }
}
