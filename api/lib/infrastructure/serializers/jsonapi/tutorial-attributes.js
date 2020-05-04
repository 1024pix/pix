const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes');
const userTutorialAttributes = require('./user-tutorial-attributes');

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
    'userTutorial',
  ],
  tutorialEvaluation: tutorialEvaluationAttributes,
  userTutorial: userTutorialAttributes
};
