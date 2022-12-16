import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  name() {
    return faker.random.word();
  },

  code() {
    return faker.datatype.number({ min: 99000, max: 99999 });
  },
});
