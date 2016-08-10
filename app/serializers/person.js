import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.records.forEach(({ fields }) => {
      fields.firstName = fields['Prénom'];
      fields.lastName = fields['Nom'];
      fields.profileUrl = fields['Image'][0].url;
    });
    return this._super(...arguments);
  }

});
