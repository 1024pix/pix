import ApplicationAdapter from './application';

export default class ResetExpiredPasswordDemand extends ApplicationAdapter {
  buildURL() {
    return `${this.host}/${this.namespace}/`;
  }
}
