import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  solution() {
    return faker.lorem.word();
  },

  hint() {
    return faker.lorem.word();
  },
});
