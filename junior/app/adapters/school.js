import ApplicationAdapter from './application';

export default class SchoolAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    query.code = query.code?.toUpperCase();
    return `${this.host}/${this.namespace}/schools`;
  }
}
