const Bookshelf = require('../bookshelf');

require('./assessment');

const bookshelfName = 'KnowledgeElement';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'knowledge-elements',
  bookshelfName,

  assessment() {
    return this.belongsTo('Assessments');
  },
});
