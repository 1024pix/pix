import ApplicationAdapter from './application';

export default class AccountRecoveryDemandAdapter extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/account-recovery`;
  }
}
