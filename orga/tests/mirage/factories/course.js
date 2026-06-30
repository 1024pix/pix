import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return faker.lorem.word(10);
  },
  description() {
    return faker.lorem.sentence();
  },

  type() {
    return 'targetProfile';
  },
});
