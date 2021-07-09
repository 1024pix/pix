import ApplicationAdapter from './application';

export default class AccountRecoveryDemandAdapter extends ApplicationAdapter {

  buildURL(
    modelName,
    id,
    snapshot,
    requestType,
    query,
  ) {
    if (requestType === 'send-account-recovery-demand') {
      return `${this.host}/${this.namespace}/account-recovery`;
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
