import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class UserTutorial extends ApplicationAdapter {
  createRecord(store, type, { adapterOptions }) {
    const url = `${this.host}/${this.namespace}/users/me/tutorials/${adapterOptions.tutorialId}`;
    return this.ajax(url, 'PUT');
  }

  deleteRecord(store, type, { adapterOptions }) {
    const url = `${this.host}/${this.namespace}/users/me/tutorials/${adapterOptions.tutorialId}`;
    return this.ajax(url, 'DELETE');
  }

  findAll() {
    const url = `${this.host}/${this.namespace}/users/me/tutorials`;
    return this.ajax(url, 'GET');
  }
}
