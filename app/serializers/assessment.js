import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.fields.name = payload.fields['Nom'];
    payload.fields.course = payload.fields['Test'];
    return this._super(...arguments);
  },

  serializeIntoHash: function (data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  },

  serialize: function (snapshot, options) {
    return {
      "Test": [
        snapshot.belongsTo('course', { id: true })
      ]
    };
  }

});
