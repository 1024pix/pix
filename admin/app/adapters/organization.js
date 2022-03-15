import ApplicationAdapter from './application';
import queryString from 'query-string';

export default class OrganizationAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.targetProfileId) {
      const { targetProfileId } = query;
      delete query.targetProfileId;
      return `${this.host}/api/admin/target-profiles/${targetProfileId}/organizations`;
    }
    return super.urlForQuery(...arguments);
  }

  findHasMany(store, snapshot, url, relationship) {
    url = this.urlPrefix(url, this.buildURL(snapshot.modelName, snapshot.id, null, 'findHasMany'));

    if (relationship.type === 'membership' && snapshot.adapterOptions) {
      const options = queryString.stringify(snapshot.adapterOptions);
      url += '?' + options;
    }

    return this.ajax(url, 'GET');
  }

  updateRecord(store, type, snapshot) {
    if (snapshot?.adapterOptions?.archiveOrganization) {
      const url = `${this.host}/${this.namespace}/admin/organizations/${snapshot.id}/archive`;
      return this.ajax(url, 'POST');
    }

    return super.updateRecord(...arguments);
  }
}
