import ApplicationAdapter from './application';

export default class TrainingTriggerAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(modelName, { adapterOptions }) {
    const { trainingId } = adapterOptions;

    return `${this.host}/${this.namespace}/trainings/${trainingId}/triggers`;
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    const payload = this.serialize(snapshot);
    payload.data.attributes.tubes = adapterOptions.tubes.map((tube) => ({
      tubeId: tube.id,
      level: tube.level,
    }));

    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    return this.ajax(url, 'PUT', { data: payload });
  }
}
