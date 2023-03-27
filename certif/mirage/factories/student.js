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

  division() {
    return faker.random.word();
  },
});
