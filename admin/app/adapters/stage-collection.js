import ApplicationAdapter from './application';

export default class StageCollectionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    const payload = this.serialize(snapshot);
    payload.data.attributes = {};
    payload.data.attributes.stages = adapterOptions.stages.map((stage) => ({
      id: stage.id,
      level: stage.level && parseInt(stage.level),
      threshold: stage.threshold && parseInt(stage.threshold),
      isFirstSkill: stage.isFirstSkill,
      title: stage.title,
      message: stage.message,
      prescriberTitle: stage.prescriberTitle,
      prescriberDescription: stage.prescriberDescription,
    }));

    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
    return this.ajax(url, 'PATCH', { data: payload });
  }
}
