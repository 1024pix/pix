import ApplicationAdapter from './application';

export default class CampaignsImportAdapter extends ApplicationAdapter {
  addCampaignsCsv(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/admin/campaigns`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
