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

  division() {
    return faker.lorem.word();
  },
});
