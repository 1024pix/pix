const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Feedback', {

  tableName: 'feedbacks',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessment() {
    return this.belongsTo('Assessment');
  }

});
