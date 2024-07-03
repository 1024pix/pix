import ApplicationAdapter from './application';

export default class CertificationCandidateSubscription extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/certification-candidates/${id}/subscriptions`;
  }
}
