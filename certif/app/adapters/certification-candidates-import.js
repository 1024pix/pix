import ApplicationAdapter from './application';

export default class CertificationCandidatesImport extends ApplicationAdapter {
  async addCertificationCandidatesFromOds(sessionId, files) {
    const file = files?.[0];
    if (!file) return;

    const url = `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates/import`;
    return this.ajax(url, 'POST', { data: file });
  }
}
