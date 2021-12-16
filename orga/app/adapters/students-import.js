import ApplicationAdapter from './application';
import ENV from 'pix-orga/config/environment';

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

  importStudentsSiecle(organizationId, files, acceptedFormat) {
    if (!files || files.length === 0) return;

    const fileToUpload = files[0];
    const fileToUploadMimeType = fileToUpload.type;
    if (!fileToUploadMimeType?.includes(acceptedFormat)) {
      throw new Error(ENV.APP.ERRORS.FILE_UPLOAD.FORMAT_NOT_SUPPORTED_ERROR);
    }

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/schooling-registrations/import-siecle?format=${acceptedFormat}`;
    return this.ajax(url, 'POST', { data: fileToUpload });
  }
}
