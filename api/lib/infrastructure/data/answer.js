const Bookshelf = require('../bookshelf');

require('./assessment');

const modelName = 'Answer';

module.exports = Bookshelf.model(modelName, {

  tableName: 'answers',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  assessment() {
    return this.belongsTo('Assessment');
  },

}, {
  modelName
});
