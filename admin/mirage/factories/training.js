import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import { createLearningContent } from '../helpers/create-learning-content';

export default Factory.extend({
  title() {
    return faker.lorem.word();
  },

  withFramework: trait({
    afterCreate(training, server) {
      createLearningContent(server);
    },
  }),
});
