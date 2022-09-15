const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes');

module.exports = {
  ref: 'id',
  includes: true,
  attributes: [
    'id',
    'duration',
    'format',
    'link',
    'source',
    'title',
    'tutorialEvaluation',
    'userSavedTutorial',
    'skillId',
  ],
  tutorialEvaluation: tutorialEvaluationAttributes,
  userSavedTutorial: userSavedTutorialAttributes,
};
