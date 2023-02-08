import ApplicationAdapter from './application';

export default class SessionsImportAdapter extends ApplicationAdapter {
  importSessions(file, certificationCenterId) {
    if (!file) return;

    const url = `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/import`;
    return this.ajax(url, 'POST', { data: file });
  }
}
