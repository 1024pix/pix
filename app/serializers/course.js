import Ember from 'ember';
import AirtableSerializer from "./airtable-serializer";
import _ from 'lodash/lodash';


export default AirtableSerializer.extend({
  transformFields(fields) {
    let result = {
      name: fields['Nom'],
      description: fields['Description'],
      duration: fields['Durée'],
      challenges: fields['Épreuves']
    };

    if (Ember.isArray(result.challenges)) {
      result.challenges.reverse();
    }

    if (fields['Image'] && fields['Image'].length > 0) {
      result.imageUrl = fields['Image'][0].url;
    }

    return result;
  }

});
