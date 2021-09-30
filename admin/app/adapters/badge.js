import ApplicationAdapter from './application';

export default class BadgeAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(modelName, { adapterOptions: { targetProfileId } }) {
    return `${this.host}/${this.namespace}/target-profiles/${targetProfileId}/badges`;
  }
}
