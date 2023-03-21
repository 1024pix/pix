import { Factory } from 'miragejs';
import faker from 'faker';
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

  sessionId() {
    return faker.random.number();
  },

  sex() {
    return faker.random.arrayElement(['M', 'F']);
  },

  birthInseeCode() {
    return faker.random.alphaNumeric(5);
  },

  birthPostalCode() {
    return faker.random.alphaNumeric(5);
  },
});
