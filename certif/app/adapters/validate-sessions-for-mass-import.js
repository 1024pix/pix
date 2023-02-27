import ApplicationAdapter from './application';

export default class SessionsImportAdapter extends ApplicationAdapter {
  validateSessionsForMassImport(file, certificationCenterId) {
    if (!file) return;

    const url = `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`;
    return this.ajax(url, 'POST', { data: file });
  }
}
