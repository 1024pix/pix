import ApplicationAdapter from './application';

export default class TargetProfileAttachmentAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { organizationId } = adapterOptions;

    return `${this.host}/${this.namespace}/organizations/${organizationId}/target-profiles`;
  }

}
