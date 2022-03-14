const { Serializer } = require('jsonapi-serializer');
const tutorialEvaluationAttributes = require('./tutorial-evaluation-attributes');
const userTutorialAttributes = require('./user-tutorial-attributes');

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
        'userTutorial',
      ],
      tutorialEvaluation: tutorialEvaluationAttributes,
      userTutorial: userTutorialAttributes,
      typeForAttribute(attribute) {
        return attribute === 'userTutorial' ? 'user-tutorial' : attribute;
      },
      meta: pagination,
    }).serialize(tutorial);
  },
};
