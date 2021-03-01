import ApplicationAdapter from './application';

export default class DivisionAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    const { organizationId } = query;
    if (organizationId) {
      delete query.organizationId;
      return `${this.host}/${this.namespace}/organizations/${organizationId}/divisions`;
    }
    return super.urlForQuery(...arguments);
  }
}
