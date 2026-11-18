import { Factory, trait } from 'miragejs';

export default Factory.extend({
  format() {
    return 'page';
  },

  duration() {
    return '00:05:00';
  },

  link() {
    return 'https://pix.fr/_nuxt/image/73cc59.svg';
  },

  title() {
    return 'temporibus';
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
