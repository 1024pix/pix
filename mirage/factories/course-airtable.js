import { faker } from 'ember-cli-mirage';
import AirtableFactory from './airtable-record';

export default AirtableFactory.extend({
  fields() {
    return {
      Nom: faker.lorem.words(3),
      Description: faker.lorem.paragraph(),
      Image: [{
        url: faker.image.imageUrl()
      }]
    }
  }
});
