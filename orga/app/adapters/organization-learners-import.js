import ApplicationAdapter from './application';

export default class OrganizationLearnersImportAdapter extends ApplicationAdapter {
  addStudentsCsv(organizationId, files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/sup-organization-learners/import-csv`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  replaceStudentsCsv(organizationId, files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/sup-organization-learners/replace-csv`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  importStudentsSiecle(organizationId, files, format) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/sco-organization-learners/import-siecle?format=${format}`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  importOrganizationLearners(organizationId, files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/import-organization-learners`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
