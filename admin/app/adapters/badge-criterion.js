import ApplicationAdapter from './application';

export default class BadgeCriterionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(modelName, { adapterOptions: { badgeId } }) {
    return `${this.host}/${this.namespace}/badges/${badgeId}/badge-criteria`;
  }
}
