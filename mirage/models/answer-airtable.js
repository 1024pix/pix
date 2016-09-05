import AirtableRecord from './airtable-record';
import attr from 'ember-data/attr';
import { hasMany } from "ember-cli-mirage";

export default AirtableRecord.extend({
  fields: {
    "Valeur": attr('string'),
    "Evaluation": hasMany('assessment-airtable'),
    "Epreuve": hasMany('challenge-airtable')
  }
});
