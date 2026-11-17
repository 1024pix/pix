import { Factory, trait } from 'miragejs';

export default Factory.extend({
  title() {
    return 'Assessment title';
  },

  type() {
    return 'COMPETENCE_EVALUATION';
  },

  hasCheckpoints() {
    return true;
  },

  showLevelup() {
    return true;
  },

  showChallengeStepper() {
    return true;
  },

  showGlobalProgression() {
    return false;
  },

  globalProgression() {
    return 0.76;
  },

  showQuestionCounter() {
    return true;
  },

  orderedChallengeIdsAnswered() {
    return [];
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
        progression: server.create('progression', { id: '3', completionRate: 0.2 }),
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

  withCurrentChallengeTimeout: trait({
    lastQuestionState: 'timeout',
  }),

  withCurrentChallengeUnfocus: trait({
    lastQuestionState: 'focusedout',
  }),
});
