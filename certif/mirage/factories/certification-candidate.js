import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

export default Factory.extend({
  firstName() {
    return faker.person.firstName();
  },

  lastName() {
    return faker.person.lastName();
  },

  birthdate() {
    return dayjs(faker.date.past({ years: 30 })).format('YYYY-MM-DD');
  },

  birthCity() {
    return faker.location.city();
  },

  birthProvinceCode() {
    return faker.string.alphanumeric(3);
  },

  birthCountry() {
    return faker.location.country();
  },

  email() {
    return faker.internet.exampleEmail();
  },

  externalId() {
    return faker.string.uuid();
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
    return faker.number.int();
  },

  sex() {
    return faker.helpers.arrayElement(['M', 'F']);
  },

  birthInseeCode() {
    return faker.string.alphanumeric(5);
  },

  birthPostalCode() {
    return faker.string.alphanumeric(5);
  },
});
