import ApplicationAdapter from './application';

export default class TrainingTriggerAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const { trainingId } = adapterOptions;

    return `${this.host}/${this.namespace}/trainings/${trainingId}/triggers`;
  }

  async delete({ trainingId, triggerId }) {
    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/triggers/${triggerId}`;
    return this.ajax(url, 'DELETE');
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
