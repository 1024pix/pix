import ApplicationAdapter from './application';

export default class CertificationCentersBatchArchiveAdapter extends ApplicationAdapter {
  archiveCertificationCenters(files) {
    if (!files || files.length === 0) return;

    const url = `${this.host}/${this.namespace}/certification-centers/batch-archive`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
