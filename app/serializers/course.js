import AirtableSerializer from "ember-airtable/serializer";
import _ from 'lodash/lodash';

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {

    if (payload.records) {
      payload.records.forEach(({ fields }) => {
        fields.name = fields['Nom'];
        fields.description = fields['Description'];
        fields.duration = fields['Durée'];
        fields.challenges = fields['Épreuves'];

        if (_.isArray(fields.challenges)) {
          fields.challenges.reverse();
        }

        if (fields['Image'] && fields['Image'].length > 0) {
          fields.imageUrl = fields['Image'][0].url;
        }
      });
    } else {
      payload.fields.name = payload.fields['Nom'];
      payload.fields.description = payload.fields['Description'];
      payload.fields.duration = payload.fields['Durée'];
      payload.fields.challenges = payload.fields['Épreuves'];

      if (_.isArray(payload.fields.challenges)) {
        payload.fields.challenges.reverse();
      }
    }
    return this._super(...arguments);
  }

});
