import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  format() {
    return 'page';
  },

  duration() {
    return '00:05:00';
  },

  link() {
    return faker.internet.url();
  },

  title() {
    return faker.random.word();
  },
});
