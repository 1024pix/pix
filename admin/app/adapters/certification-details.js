import ApplicationAdapter from './application';

export default class CertificationDetails extends ApplicationAdapter {

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}/details`;
  }
}
