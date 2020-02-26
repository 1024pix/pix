import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  name(i) {
    return `Organization ${i}`;
  },

  email() {
    return faker.internet.exampleEmail();
  },

  type() {
    return 'SCO';
  },

  code(i) {
    return `ABCD0${i}`;
  }
});
