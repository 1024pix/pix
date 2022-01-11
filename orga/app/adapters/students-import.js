import ApplicationAdapter from './application';

export default class StudentImportsAdapter extends ApplicationAdapter {
  addStudentsCsv(organizationId, files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/schooling-registrations/import-csv`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  replaceStudentsCsv(organizationId, files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/schooling-registrations/replace-csv`;
    return this.ajax(url, 'POST', { data: files[0] });
  }

  importStudentsSiecle(organizationId, files, format) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/schooling-registrations/import-siecle?format=${format}`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
