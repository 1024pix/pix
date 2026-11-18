import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  scorecard: belongsTo('scorecard', { inverse: 'tutorials' }),
  userSavedTutorial: belongsTo('userSavedTutorial', { inverse: 'tutorial' }),
  tutorialEvaluation: belongsTo('tutorialEvaluation', { inverse: 'tutorial' }),
});
