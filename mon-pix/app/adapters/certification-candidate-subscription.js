import ApplicationAdapter from './application';

export default class AccountRecoveryDemandAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/certification-candidates/${id}/subscriptions`;
  }
}
