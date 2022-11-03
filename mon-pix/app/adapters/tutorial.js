import ApplicationAdapter from './application';

export default class Tutorial extends ApplicationAdapter {
  urlForQuery(query, ...args) {
    if (query.userId) {
      const { userId } = query;
      delete query.userId;
      return `${this.host}/${this.namespace}/users/${userId}/tutorials`;
    }
    return super.urlForQuery(query, ...args);
  }
}
