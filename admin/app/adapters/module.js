import ApplicationAdapter from './application';

export default class Module extends ApplicationAdapter {
  namespace = 'api';
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/modules/v2/${id}`;
  }
}
