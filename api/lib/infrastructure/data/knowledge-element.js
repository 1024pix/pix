const Bookshelf = require('../bookshelf');

require('./assessment');
require('./answer');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',

  assessment() {
    return this.belongsTo('Assessment');
  },

  answer() {
    return this.belongsTo('Answer');
  }
});
