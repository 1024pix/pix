import ApplicationAdapter from './application';

export default class CombinedCourseBlueprintAdapter extends ApplicationAdapter {
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
    if (!snapshot.adapterOptions) {
      return super.createRecord(...arguments);
    }

    const { adapterOptions } = snapshot;
    const payload = this.serialize(snapshot);

    if (adapterOptions.cappedTubeRequirements) {
      const { cappedTubeRequirements } = adapterOptions;
      payload.data.attributes['capped-tube-requirements'] = cappedTubeRequirements;
    } else if (adapterOptions.schemaThreshold) {
      const { schemaThreshold } = adapterOptions;
      payload.data.attributes['schema-threshold'] = schemaThreshold;
    }

    const url = this.urlForCreateRecord(type.modelName, snapshot);
    return this.ajax(url, 'POST', { data: payload });
  }
}
