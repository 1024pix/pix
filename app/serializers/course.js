import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {

    if (payload.records) {
      payload.records.forEach(({ fields }) => {
        fields.name = fields['Nom'];
        fields.description = fields['Description'];
        fields.duration = fields['Durée'];
        fields.challenges = fields['Épreuves'];

        if (fields['Image'] && fields['Image'].length > 0) {
          fields.imageUrl = fields['Image'][0].url;
        }
      });
    } else {
      payload.fields.name = payload.fields['Nom'];
      payload.fields.description = payload.fields['Description'];
      payload.fields.duration = payload.fields['Durée'];
      payload.fields.challenges = payload.fields['Épreuves'];
    }
    return this._super(...arguments);
  }

});
