import ApplicationAdapter from './application';

export default class Tutorial extends ApplicationAdapter {
  urlForQuery(query, ...args) {
    if (query.type) {
      const { type } = query;
      delete query.type;
      return `${this.host}/${this.namespace}/users/tutorials/${type}`;
    }
    return super.urlForQuery(query, ...args);
  }
}
