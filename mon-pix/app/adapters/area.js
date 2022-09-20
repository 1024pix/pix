import ApplicationAdapter from './application';

export default class Area extends ApplicationAdapter {
  urlForFindAll() {
    return `${this.host}/${this.namespace}/frameworks/pix/areas-for-user`;
  }
}
