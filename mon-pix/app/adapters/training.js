import ApplicationAdapter from './application';

export default class Training extends ApplicationAdapter {
  urlForQuery(query, ...args) {
    if (query.userId) {
      const { userId } = query;
      delete query.userId;
      return `${this.host}/${this.namespace}/users/${userId}/trainings`;
    }
    return super.urlForQuery(query, ...args);
  }
}
