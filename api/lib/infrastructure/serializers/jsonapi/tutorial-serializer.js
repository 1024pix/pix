const { Serializer } = require('jsonapi-serializer');
const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes');
const userSavedTutorialAttributes = require('./user-saved-tutorial-attributes');

module.exports = {
  serialize(tutorial = {}, pagination) {
    return new Serializer('tutorials', {
      attributes: [
        'duration',
        'format',
        'link',
        'source',
        'title',
        'tubeName',
        'tubePracticalTitle',
        'tubePracticalDescription',
        'tutorialEvaluation',
        'userSavedTutorial',
        'skillId',
      ],
      tutorialEvaluation: tutorialEvaluationAttributes,
      userSavedTutorial: userSavedTutorialAttributes,
      typeForAttribute(attribute) {
        return attribute === 'userSavedTutorial' ? 'user-saved-tutorial' : attribute;
      },
      meta: pagination,
    }).serialize(tutorial);
  },
};
