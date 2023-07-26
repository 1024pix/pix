import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  extractErrors(_store, typeClass, payload, _id) {
    if (payload && typeof payload === 'object' && payload.errors) {
      payload = payload.errors;
      this.normalizeErrors(typeClass, payload);
    }
    return payload;
  }
}
