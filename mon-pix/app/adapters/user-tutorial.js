import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class UserTutorial extends ApplicationAdapter {
  createRecord(store, type, { adapterOptions }) {
    const url = `${this.host}/${this.namespace}/users/tutorials/${adapterOptions.tutorialId}`;
    return this.ajax(url, 'PUT');
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/users/tutorials/${adapterOptions.tutorialId}`;
  }

  urlForFindAll() {
    return `${this.host}/${this.namespace}/users/tutorials`;
  }
}
