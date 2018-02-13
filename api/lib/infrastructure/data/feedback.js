const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('Feedback', {

  tableName: 'feedbacks',

  assessment() {
    return this.belongsTo('Assessment');
  }

});
