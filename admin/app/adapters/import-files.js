import ApplicationAdapter from './application';

export default class ImportFilesAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  importCampaignsToArchive(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/campaigns/archive-campaigns`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
