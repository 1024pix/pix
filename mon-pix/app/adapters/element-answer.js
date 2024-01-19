import ApplicationAdapter from './application';

export default class ElementAnswer extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/passages/${adapterOptions.passageId}/answers`;
  }

  createRecord(store, type, snapshot) {
    const url = this.urlForCreateRecord(type.modelName, snapshot);
    const serializedSnapshot = this.serialize(snapshot);

    return this.ajax(url, 'POST', {
      data: {
        data: {
          attributes: {
            'element-id': serializedSnapshot.data.relationships.element.data.id,
            'user-response': serializedSnapshot.data.attributes['user-response'],
          },
        },
      },
    });
  }
}
