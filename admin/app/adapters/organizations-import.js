import ApplicationAdapter from './application';

export default class OrganizationsImportAdapter extends ApplicationAdapter {
  addOrganizationsCsv(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/admin/organizations/import-csv`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
