import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  title() {
    return faker.random.words();
  },

  type() {
    return 'COMPETENCE_EVALUATION';
  },

  withStartedState: trait({
    state: 'started'
  }),

  withCompletedState: trait({
    state: 'completed'
  }),

  ofCompetenceEvaluationType: trait({
    type: 'COMPETENCE_EVALUATION',
  }),

  ofCertificationType: trait({
    type: 'CERTIFICATION',
  }),

  ofDemoType: trait({
    type: 'DEMO',
  }),

  ofSmartPlacementType: trait({
    type: 'SMART_PLACEMENT',
  }),

});
