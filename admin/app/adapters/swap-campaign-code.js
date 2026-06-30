import ApplicationAdapter from './application';

export default class SwapCampaignCode extends ApplicationAdapter {
  swap({ firstCampaignId, secondCampaignId }) {
    const url = `${this.host}/${this.namespace}/campaigns/swap-codes`;

    return this.ajax(url, 'POST', { data: { firstCampaignId, secondCampaignId } });
  }
}
