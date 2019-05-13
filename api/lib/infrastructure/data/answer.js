const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Answer', {

  tableName: 'answers',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessment() {
    return this.belongsTo('Assessment');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'answerId');
  }
});
