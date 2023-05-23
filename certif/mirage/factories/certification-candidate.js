import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  birthdate() {
    return dayjs(faker.date.past(30)).format('YYYY-MM-DD');
  },

  birthCity() {
    return faker.location.city();
  },

  birthProvinceCode() {
    return faker.random.alphaNumeric(3);
  },

  birthCountry() {
    return faker.location.country();
  },

  email() {
    return faker.internet.exampleEmail();
  },

  externalId() {
    return faker.datatype.uuid();
  },

  extraTimePercentage() {
    if (faker.datatype.boolean()) {
      return 0.3;
    }

    return null;
  },

  isLinked() {
    return faker.datatype.boolean();
  },

  sessionId() {
    return faker.datatype.number();
  },

  sex() {
    return faker.helpers.arrayElement(['M', 'F']);
  },

  birthInseeCode() {
    return faker.random.alphaNumeric(5);
  },

  birthPostalCode() {
    return faker.random.alphaNumeric(5);
  },
});
