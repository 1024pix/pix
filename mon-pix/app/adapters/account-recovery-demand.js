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
      return `${this.host}/${this.namespace}/`;
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

  urlForQueryRecord(query) {
    if (query.temporaryKey) {
      const url = `${this.host}/${this.namespace}/account-recovery/${query.temporaryKey}`;
      delete query.temporaryKey;
      return url;
    }

    return super.urlForQueryRecord(query);
  }
}
