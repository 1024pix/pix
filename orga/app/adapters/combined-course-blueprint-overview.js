import ApplicationAdapter from './application';

export default class CombinedCourseBlueprintOverviewAdapter extends ApplicationAdapter {
  urlForFindRecord(id, modelName, snapshot) {
    const { organizationId } = snapshot.adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/combined-course-blueprints/${id}`;
  }
}
