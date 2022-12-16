import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return `rec_${i}`;
  },

  name() {
    return faker.lorem.word();
  },

  description() {
    return faker.lorem.paragraph();
  },
});
