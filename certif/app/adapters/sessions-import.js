import ApplicationAdapter from './application';

export default class SessionsImportAdapter extends ApplicationAdapter {
  importSessions(files, certificationCenterId) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/import`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
