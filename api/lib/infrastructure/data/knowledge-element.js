const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',
  hasTimestamps: ['createdAt', null],

  domainModelName: 'SmartPlacementKnowledgeElement',

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User');
  },

  answer() {
    return this.belongsTo('Answer', 'answerId');
  }

});
