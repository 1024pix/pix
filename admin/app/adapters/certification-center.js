import ApplicationAdapter from './application';

export default class CertificationCenterAdapter extends ApplicationAdapter {
  archiveCertificationCenter(certificationCenterId) {
    return this.ajax(`${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/archive`, 'POST');
  }
}
