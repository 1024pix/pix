import { faker } from 'ember-cli-mirage';
import AirtableFactory from './airtable-record';

export default AirtableFactory.extend({
  fields() {
    return {
      "Consigne": faker.lorem.paragraphs(2),
      "Propositions": "- yo \n - yo yo \n - yo yo yo",
      "Type d'épreuve": 'QCU'
    }
  }
});
