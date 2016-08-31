import AirtableRecord from './airtable-record';
import attr from 'ember-data/attr';
import { hasMany } from "ember-cli-mirage";

export default AirtableRecord.extend({
  fields: {
    Nom: attr('string'),
    Description: attr('string'),
    Image: [attr('string')],
    "Épreuves": hasMany('challenge-airtable')
  }
});
