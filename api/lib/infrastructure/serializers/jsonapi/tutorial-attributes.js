const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes.js');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes.js');
const tutorialAttributes = {
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

module.exports = tutorialAttributes;
