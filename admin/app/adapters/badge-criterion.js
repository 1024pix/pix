import ApplicationAdapter from './application';

export default class BadgeCriterionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(_modelName, badgeCriterion) {
    return `${this.host}/${this.namespace}/badges/${badgeCriterion.belongsTo('badge').id}/badge-criteria`;
  }
}
