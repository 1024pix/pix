import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class BadgeCriterionSerializer extends JSONAPISerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    delete json.data.relationships?.badge;
    return json;
  }
}
