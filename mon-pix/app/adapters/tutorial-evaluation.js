import ApplicationAdapter from './application';

export default class TutorialEvaluation extends ApplicationAdapter {
  createRecord(store, type, { adapterOptions }) {
    const url = `${this.host}/${this.namespace}/users/tutorials/${adapterOptions.tutorialId}/evaluate`;
    return this.ajax(url, 'PUT');
  }
}
