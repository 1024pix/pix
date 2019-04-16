const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',
  hasTimestamps: ['createdAt', null],

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User');
  },

});
