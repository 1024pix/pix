import ApplicationAdapter from './application';

export default class ImportFilesAdapter extends ApplicationAdapter {
  importCampaignsToArchive(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/campaigns/archive-campaigns`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  updateOrganizationImportFormat(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organization-learner-import-formats`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  addCampaignsCsv(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/campaigns`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
