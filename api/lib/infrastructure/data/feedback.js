const Bookshelf = require('../bookshelf');

require('./assessment');

const modelName = 'Feedback';

module.exports = Bookshelf.model(modelName, {

  tableName: 'feedbacks',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  assessment() {
    return this.belongsTo('Assessment');
  },

}, {
  modelName
});
