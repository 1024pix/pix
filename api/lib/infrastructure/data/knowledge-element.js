const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',

  assessment() {
    return this.belongsTo('Assessments');
  },
});
