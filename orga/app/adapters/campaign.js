import ApplicationAdapter from './application';

export default class CampaignAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.filter.organizationId) {
      const { organizationId } = query.filter;
      delete query.filter.organizationId;

      return `${this.host}/${this.namespace}/organizations/${organizationId}/campaigns`;
    }
    return super.urlForQuery(...arguments);
  }

  delete(organizationId, ids) {
    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/campaigns`;
    const payload = { data: ids.map((id) => ({ type: 'campaign', id })) };
    return this.ajax(url, 'DELETE', { data: payload });
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
