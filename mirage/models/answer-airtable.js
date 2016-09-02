import AirtableRecord from './airtable-record';
import attr from 'ember-data/attr';
import { hasMany } from "ember-cli-mirage";

export default AirtableRecord.extend({
  fields: {
    "Valeur": attr('string')
  }
});
