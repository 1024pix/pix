import ApplicationSerializer from './application';
export default class CombinedCourseBlueprintSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const json = super.serialize(...arguments);
    json.data.attributes.content = json.data.attributes.content.map(({ type, value }) => ({ type, value }));

    delete json.data.attributes['attestation-label'];

    if (snapshot.id) {
      delete json.data.id;
      delete json.data.attributes['created-at'];
      delete json.data.attributes['content'];
      delete json.data.attributes['reward-id'];
      delete json.data.attributes['reward-type'];
      delete json.data.attributes['capped-tube-requirements'];

      for (const attribute of ['illustration', 'description', 'reward-requirements', 'survey-link']) {
        json.data.attributes[attribute] = json.data.attributes[attribute] || null;
      }
    }

    return json;
  }
}
