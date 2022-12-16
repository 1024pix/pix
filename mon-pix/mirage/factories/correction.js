import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  solution() {
    return faker.random.word();
  },

  hint() {
    return faker.random.word();
  },
});
