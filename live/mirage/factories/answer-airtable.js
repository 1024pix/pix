import { faker } from 'ember-cli-mirage';
import AirtableFactory from './airtable-record';

export default AirtableFactory.extend({
  fields() {
    return {
      "Valeur": faker.random.word()
    }
  }
});
