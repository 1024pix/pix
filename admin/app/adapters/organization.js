import queryString from 'query-string';

import ApplicationAdapter from './application';

export default class OrganizationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    if (query.targetProfileId) {
      const { targetProfileId } = query;
      delete query.targetProfileId;
      return `${this.host}/${this.namespace}/target-profiles/${targetProfileId}/organizations`;
    }
    return super.urlForQuery(...arguments);
  }

  findHasMany(store, snapshot, url, relationship) {
    url = this.urlPrefix(url, this.buildURL(snapshot.modelName, snapshot.id, null, 'findHasMany'));

    if (relationship.type === 'organization-membership' && snapshot.adapterOptions) {
      const options = queryString.stringify(snapshot.adapterOptions);
      url = `${this.host}/${this.namespace}/organizations/${snapshot.id}/memberships?${options}`;
    }

    return this.ajax(url, 'GET');
  }

  updateRecord(store, type, snapshot) {
    if (snapshot?.adapterOptions?.archiveOrganization) {
      const url = `${this.host}/${this.namespace}/organizations/${snapshot.id}/archive`;
      return this.ajax(url, 'POST');
    }

    return super.updateRecord(...arguments);
  }

  async attachTargetProfile(options) {
    const { organizationId } = options;
    const payload = {
      'target-profile-ids': options.targetProfileIds,
    };

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/attach-target-profiles`;
    return this.ajax(url, 'POST', { data: payload });
  }

  attachChildOrganization({ childOrganizationIds, parentOrganizationId }) {
    const url = `${this.host}/${this.namespace}/organizations/${parentOrganizationId}/attach-child-organization`;
    return this.ajax(url, 'POST', { data: { childOrganizationIds } });
  }

  archiveOrganizations(files) {
    if (!files || files.length === 0) return;
    const url = `${this.host}/${this.namespace}/organizations/batch-archive`;
    return this.ajax(url, 'POST', { data: files[0] });
  }
}
