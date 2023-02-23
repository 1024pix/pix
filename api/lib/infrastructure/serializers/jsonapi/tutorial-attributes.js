const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes.js');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes.js');

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
