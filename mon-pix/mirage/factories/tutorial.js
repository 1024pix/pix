import { Factory, trait } from 'miragejs';
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

  withUserSavedTutorial: trait({
    afterCreate(tutorial, server) {
      server.schema.create('user-saved-tutorial', { tutorial });
    },
  }),

  withTutorialEvaluation: trait({
    afterCreate(tutorial, server) {
      server.schema.create('tutorial-evaluation', { tutorial, status: 'LIKED' });
    },
  }),
});
