import ApplicationAdapter from './application';

export default class ActivityAnswer extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const { data } = this.serialize(snapshot);

      const meta = {};
      if (adapterOptions.assessmentId) {
        meta.assessmentId = adapterOptions.assessmentId;
      }
      if (adapterOptions.isPreview) {
        meta.isPreview = adapterOptions.isPreview;
      }
      const payload = { data: { data, meta } };
      return this.ajax(url, 'POST', payload);
    }

    return super.createRecord(...arguments);
  }
}
