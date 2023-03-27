import { Factory, trait } from 'miragejs';
import faker from 'faker';
import { createLearningContent } from '../helpers/create-learning-content';

export default Factory.extend({
  title() {
    return faker.random.word();
  },

  withFramework: trait({
    afterCreate(training, server) {
      createLearningContent(server);
    },
  }),
});
