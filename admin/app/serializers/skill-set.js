import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class SkillSetSerializer extends JSONAPISerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    delete json.data.relationships;
    return json;
  }
}
