import ApplicationAdapter from './application';

export default class ElementAnswer extends ApplicationAdapter {
  urlForCreateRecord(modelName, snapshot) {
    const passageId = snapshot.belongsTo('passage', { id: true });
    return `${this.host}/${this.namespace}/passages/${passageId}/answers`;
  }

  createRecord(store, type, snapshot) {
    const url = this.urlForCreateRecord(type.modelName, snapshot);
    const serializedSnapshot = this.serialize(snapshot);

    return this.ajax(url, 'POST', {
      data: {
        data: {
          attributes: {
            'element-id': serializedSnapshot.data.attributes['element-id'],
            'user-response': serializedSnapshot.data.attributes['user-response'],
          },
        },
      },
    });
  }
}
