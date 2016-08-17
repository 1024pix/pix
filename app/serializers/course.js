import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.records.forEach(({ fields }) => {
      fields.name = fields['Nom'];
      fields.description = fields['Description'];
      fields.duration = fields['Durée'];

      if (fields['Image'] && fields['Image'].length > 0) {
        fields.imageUrl = fields['Image'][0].url;
      }
    });
    return this._super(...arguments);
  }

});
