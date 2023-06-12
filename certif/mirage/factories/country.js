import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  name() {
    return faker.lorem.word();
  },

  code() {
    return faker.number.int({ min: 99000, max: 99999 });
  },
});
