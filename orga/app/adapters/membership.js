import ApplicationAdapter from './application';

export default class MembershipAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    if (query.filter.organizationId) {
      const { organizationId } = query.filter;
      delete query.filter.organizationId;

      return `${this.host}/${this.namespace}/organizations/${organizationId}/memberships`;
    }
    return super.urlForQuery(...arguments);
  }
}
