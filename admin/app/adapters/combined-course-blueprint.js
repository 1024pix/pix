import ApplicationAdapter from './application';

export default class CombinedCourseBlueprintAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  async detachOrganizations(combinedCourseBlueprintId, organizationId) {
    const url = `${this.host}/${this.namespace}/combined-course-blueprints/${combinedCourseBlueprintId}/organizations/${organizationId}`;
    await this.ajax(url, 'DELETE');
  }
  async attachOrganizations({ combinedCourseBlueprintId, organizationIds }) {
    const url = `${this.host}/${this.namespace}/combined-course-blueprints/${combinedCourseBlueprintId}/organizations`;
    const result = await this.ajax(url, 'POST', {
      data: { 'organization-ids': organizationIds },
    });
    return result;
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    if (adapterOptions && adapterOptions.cappedTubeRequirements) {
      const { cappedTubeRequirements } = adapterOptions;
      const payload = this.serialize(snapshot);
      payload.data.attributes['capped-tube-requirements'] = cappedTubeRequirements;

      const url = this.urlForCreateRecord(type.modelName, snapshot);

      return this.ajax(url, 'POST', { data: payload });
    }

    return super.createRecord(...arguments);
  }
}
