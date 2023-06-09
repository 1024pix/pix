import ApplicationAdapter from './application';

export default class ActivityAnswer extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.assessmentId) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const { data } = this.serialize(snapshot);
      const payload = { data: { data, meta: { assessmentId: adapterOptions.assessmentId } } };
      return this.ajax(url, 'POST', payload);
    }

    return super.createRecord(...arguments);
  }
}
