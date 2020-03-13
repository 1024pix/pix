import { Factory } from 'ember-cli-mirage';
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
