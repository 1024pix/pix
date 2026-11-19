import ApplicationAdapter from './application';

export default class OrganizationLearnersImportAdapter extends ApplicationAdapter {
  addStudentsCsv(organizationId: string, files: FileList) {
    return this.upload(`organizations/${organizationId}/sup-organization-learners/import-csv`, files);
  }

  replaceStudentsCsv(organizationId: string, files: FileList) {
    return this.upload(`organizations/${organizationId}/sup-organization-learners/replace-csv`, files);
  }

  importStudentsSiecle(organizationId: string, files: FileList, format: 'csv' | 'xml') {
    return this.upload(
      `organizations/${organizationId}/sco-organization-learners/import-siecle?format=${format}`,
      files,
    );
  }

  importOrganizationLearners(organizationId: string, files: FileList) {
    return this.upload(`organizations/${organizationId}/import-organization-learners`, files);
  }

  private upload(path: string, files: FileList) {
    const [file] = files;
    if (!file) return;

    return this.ajax(this.apiUrl(path), 'POST', { data: file });
  }
}
