import ApplicationAdapter from './application';

export default class SupervisorAuthenticationAdapter extends ApplicationAdapter {
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/sessions/supervise`;
  }
}
