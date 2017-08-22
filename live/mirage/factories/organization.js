import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name(i) {
    return `Organization ${i}`;
  },

  email() {
    return faker.internet.email();
  },

  type() {
    return 'SCO';
  },

  code(i) {
    return `ABCD0${i}`;
  }
});
