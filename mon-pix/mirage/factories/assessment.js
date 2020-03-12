import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  type() {
    return faker.lorem.word();
  },

  title() {
    return faker.lorem.word();
  },

  afterCreate(assessment, server) {
    assessment.update({ course: server.create('course') });
  },

  withStartedState: trait({
    state: 'started'
  }),

  withCompletedState: trait({
    state: 'completed'
  }),

  withPlacementType: trait({
    type: 'PLACEMENT'
  }),

});
