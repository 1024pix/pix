import ApplicationAdapter from './application';

export default class CertificationInfo extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/certifications/${id}/info`;
  }
}
