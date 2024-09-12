import ApplicationAdapter from './application';

export default class TargetProfileAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions?.markTargetProfileAsSimplifiedAccess) {
      const url = `${this.host}/${this.namespace}/target-profiles/${snapshot.id}/simplified-access`;
      return this.ajax(url, 'PUT');
    }

    const payload = this.serialize(snapshot, {
      update: true,
      tubes: adapterOptions?.tubes,
    });

    const url = `${this.host}/${this.namespace}/target-profiles/${snapshot.id}`;
    return this.ajax(url, 'PATCH', { data: payload });
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.tubes) {
      const { tubes } = adapterOptions;
      const payload = this.serialize(snapshot);
      payload.data.attributes.tubes = tubes;

      const url = `${this.host}/${this.namespace}/target-profiles`;

      return this.ajax(url, 'POST', { data: payload });
    }

    return super.createRecord(...arguments);
  }

  async detachOrganizations(targetProfileId, organizationIds) {
    const url = `${this.host}/${this.namespace}/target-profiles/${targetProfileId}/detach-organizations`;
    const result = await this.ajax(url, 'DELETE', {
      data: { data: { attributes: { 'organization-ids': organizationIds } } },
    });
    return result.data.attributes['detached-organization-ids'];
  }

  async attachToOrganization(options) {
    const { organizationId } = options;
    const payload = {
      'target-profile-ids': options.targetProfileIds,
    };

    const url = `${this.host}/${this.namespace}/organizations/${organizationId}/attach-target-profiles`;
    return this.ajax(url, 'POST', { data: payload });
  }

  async attachToTraining(options) {
    const { trainingId } = options;
    const payload = {
      'target-profile-ids': options.targetProfileIds,
    };

    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/attach-target-profiles`;
    return this.ajax(url, 'POST', { data: payload });
  }

  urlForQueryRecord(query) {
    if (query.targetProfileId) {
      const { targetProfileId } = query;
      delete query.targetProfileId;
      return `${this.host}/${this.namespace}/target-profiles/${targetProfileId}`;
    }

    return super.urlForQueryRecord(...arguments);
  }
}
