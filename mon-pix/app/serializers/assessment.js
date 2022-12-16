import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class AssessmentSerializer extends JSONAPISerializer {
  serialize(...args) {
    const json = super.serialize(...args);
    const [{ adapterOptions }] = args;

    json.data.attributes['challenge-id'] = adapterOptions?.challengeId;

    return json;
  }
}
