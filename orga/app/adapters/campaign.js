import ApplicationAdapter from './application';

export default class Campaign extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.filter.organizationId) {
      const { organizationId } = query.filter;
      delete query.filter.organizationId;

      return `${this.host}/${this.namespace}/organizations/${organizationId}/campaigns`;
    }
    return super.urlForQuery(...arguments);
  }

  archive(model) {
    const url = this.buildURL('campaign', model.id) + '/archive';
    return this.ajax(url, 'PUT');
  }

  unarchive(model) {
    const url = this.buildURL('campaign', model.id) + '/archive';
    return this.ajax(url, 'DELETE');
  }
}
