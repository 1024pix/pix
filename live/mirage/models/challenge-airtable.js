import AirtableRecord from './airtable-record';
import attr from 'ember-data/attr';

export default AirtableRecord.extend({
  fields: {
    "Consigne": attr('string'),
    "Propositions QCU / QCM": attr('string'),
    "Type d'épreuve": attr('string')
  }
});
