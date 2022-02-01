import ApplicationAdapter from './application';

export default class WithRequiredSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    return `${this.host}/${this.namespace}/sessions/with-required-action`;
  }
}
