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
    'userTutorial',
  ],
  userTutorial: userTutorialAttributes,
};
