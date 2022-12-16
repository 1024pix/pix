import ApplicationAdapter from './application';

export default class UserSavedTutorial extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const tutorial = snapshot.belongsTo('tutorial');
    const url = `${this.host}/${this.namespace}/users/tutorials/${tutorial.id}`;
    return this.ajax(url, 'PUT', { data: { data: { attributes: { 'skill-id': tutorial.attr('skillId') } } } });
  }

  urlForDeleteRecord(id, modelName, snapshot) {
    const tutorial = snapshot.belongsTo('tutorial');
    return `${this.host}/${this.namespace}/users/tutorials/${tutorial.id}`;
  }
}
