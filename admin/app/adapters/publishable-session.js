import ApplicationAdapter from './application';

export default class PublishableSessionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindAll() {
    return `${this.host}/${this.namespace}/sessions/to-publish`;
  }
}
