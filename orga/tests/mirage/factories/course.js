import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return faker.lorem.word();
  },
  description() {
    return faker.lorem.sentence();
  },

  type() {
    return 'targetProfile';
  },
});
