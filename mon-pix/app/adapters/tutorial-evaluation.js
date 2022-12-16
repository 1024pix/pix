import ApplicationAdapter from './application';

export default class TutorialEvaluation extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/users/tutorials/${adapterOptions.tutorialId}/evaluate`;
  }

  urlForUpdateRecord(modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/users/tutorials/${adapterOptions.tutorialId}/evaluate`;
  }

  createRecord(store, type, snapshot) {
    const url = this.urlForCreateRecord(type.modelName, snapshot);
    return this.ajax(url, 'PUT', {
      data: {
        data: {
          attributes: { status: snapshot.adapterOptions.status },
        },
      },
    });
  }

  updateRecord(store, type, snapshot) {
    const url = this.urlForUpdateRecord(type.modelName, snapshot);
    return this.ajax(url, 'PUT', {
      data: {
        data: {
          attributes: { status: snapshot.adapterOptions.status },
        },
      },
    });
  }
}
