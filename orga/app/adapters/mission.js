import ApplicationAdapter from './application';

export default class MissionAdapter extends ApplicationAdapter {
  urlForFindAll(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/missions`;
  }
  // urlForFindRecord(id) {
  //   return `${this.host}/${this.namespace}/pix1d/missions/${id}`;
  // }
  urlForQueryRecord(query) {
    const { organizationId, missionId } = query;
    delete query.organizationId;
    delete query.missionId;
    return `${this.host}/${this.namespace}/organizations/${organizationId}/missions/${missionId}`;
  }
}
