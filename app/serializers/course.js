import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.records.forEach(() => {
      // todo
    });
    return this._super(...arguments);
  }

});
