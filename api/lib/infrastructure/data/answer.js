const Bookshelf = require('../bookshelf');

require('./assessment');
require('./knowledge-element');

module.exports = Bookshelf.model('Answer', {

  tableName: 'answers',

  assessment() {
    return this.belongsTo('Assessment');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'answerId');
  },

});
