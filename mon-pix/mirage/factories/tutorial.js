import { Factory, trait } from 'ember-cli-mirage';
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

  withUserTutorial: trait({
    afterCreate(tutorial, server) {
      server.schema.create('user-tutorial', { tutorial });
    },
  }),
});
