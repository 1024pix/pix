const { Serializer } = require('jsonapi-serializer');
const userTutorialAttributes = require('./user-tutorial-attributes');

module.exports = {

  serialize(tutorial = {}) {
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
        'userTutorial'
      ],
      userTutorial: userTutorialAttributes,
      typeForAttribute(attribute) {
        return attribute === 'userTutorial' ? 'user-tutorial' : attribute;
      }
    }).serialize(tutorial);
  },

};
