const { Serializer } = require('jsonapi-serializer');
const tutorialAttributes = require('./tutorial-attributes');

module.exports = {

  serialize(correction) {
    return new Serializer('corrections', {
      attributes: ['solution', 'hint', 'tutorials', 'learningMoreTutorials'],
      tutorials: tutorialAttributes,
      learningMoreTutorials: tutorialAttributes,
      typeForAttribute(attribute) {
        switch (attribute) {
          case 'userTutorial':
            return 'user-tutorial';
          case 'learningMoreTutorials':
            return 'tutorials';
          default:
            return attribute;
        }
      },
      transform: (record) => {
        const correction = Object.assign({}, record);
        correction.hint = typeof (record.relevantHint) !== 'undefined' ? record.relevantHint.value : null;
        return correction;
      }
    }).serialize(correction);
  }
};
