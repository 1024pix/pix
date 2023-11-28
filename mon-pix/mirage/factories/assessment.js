import { Factory, trait } from 'miragejs';

export default Factory.extend({
  title() {
    return 'Assessment title';
  },

  type() {
    return 'COMPETENCE_EVALUATION';
  },

  withStartedState: trait({
    state: 'started',
  }),

  withCompletedState: trait({
    state: 'completed',
  }),

  ofCompetenceEvaluationType: trait({
    type: 'COMPETENCE_EVALUATION',
    afterCreate(assessment, server) {
      assessment.update({
        progression: server.create('progression', { id: 3, completionRate: 20 }),
      });
    },
  }),

  ofCertificationType: trait({
    type: 'CERTIFICATION',
  }),

  ofDemoType: trait({
    type: 'DEMO',
  }),

  ofCampaignType: trait({
    type: 'CAMPAIGN',
  }),

  ofFlashCampaignType: trait({
    type: 'CAMPAIGN',
    method: 'FLASH',
  }),

  withCurrentChallengeTimeout: trait({
    lastQuestionState: 'timeout',
  }),

  withCurrentChallengeUnfocus: trait({
    lastQuestionState: 'focusedout',
  }),
});
