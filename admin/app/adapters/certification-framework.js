import ApplicationAdapter from './application';

export default class CertificationFrameworkAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/certification-frameworks/${id}/target-profiles`;
  }
}
