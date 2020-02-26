import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';

export default Factory.extend({

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  birthdate() {
    return moment(faker.date.past(30)).format('YYYY-MM-DD');
  },

  birthCity() {
    return faker.address.city();
  },

  birthProvinceCode() {
    return faker.random.alphaNumeric(3);
  },

  birthCountry() {
    return faker.address.country();
  },

  email() {
    return faker.internet.exampleEmail();
  },

  externalId() {
    return faker.random.uuid();
  },

  extraTimePercentage() {
    if (faker.random.boolean()) {
      return 0.3;
    }

    return null;
  },

  isLinked() {
    return faker.random.boolean();
  },

});
