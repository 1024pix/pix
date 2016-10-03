import AirtableRecord from './airtable-record';
import attr from 'ember-data/attr';
import { hasMany } from "ember-cli-mirage";

export default AirtableRecord.extend({
  fields: {
    "Référence": attr('string'),
    "Test": hasMany('course-airtable'),
    "Reponses": hasMany('answer-airtable')
  }
});
