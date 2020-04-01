import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  solution() {
    return faker.random.word();
  },

  hint() {
    return faker.random.word();
  }
});
