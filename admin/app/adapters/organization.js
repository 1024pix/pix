import ApplicationAdapter from './application';

export default class OrganizationAdapter extends ApplicationAdapter {
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

  detachChildOrganizationFromParent({ childOrganizationId }) {
    const url = `${this.host}/${this.namespace}/organizations/${childOrganizationId}/detach-parent-organization`;
    return this.ajax(url, 'POST');
  }
}
