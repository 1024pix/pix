import ApplicationAdapter from './application';

export default class CertificationDetails extends ApplicationAdapter {

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}/details`;
  }

  buildURL(
    modelName,
    id,
    snapshot,
    requestType,
    query,
  ) {
    if (requestType === 'neutralize-challenge') {
      return `${this.host}/${this.namespace}/admin/certification/`;
    } else {
      return super.buildURL(
        modelName,
        id,
        snapshot,
        requestType,
        query,
      );
    }
  }
}
