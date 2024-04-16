import ApplicationAdapter from './application';

export default class BadgeCriterionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(_modelName, badgeCriterion) {
    return `${this.host}/${this.namespace}/badges/${badgeCriterion.belongsTo('badge').id}/badge-criteria`;
  }

  updateRecord(store, type, snapshot) {
    const payload = this.serialize(snapshot);
    delete payload.data.attributes['scope'];

    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
    return this.ajax(url, 'PATCH', { data: payload });
  }
}
