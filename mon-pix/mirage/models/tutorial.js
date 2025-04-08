import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  scorecard: belongsTo(),
  userSavedTutorial: belongsTo(),
  tutorialEvaluation: belongsTo(),
});
