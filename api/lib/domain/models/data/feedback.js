const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

const Assessment = require('./assessment');

module.exports = Bookshelf.model('Feedback', {

  tableName: 'feedbacks',

  assessment() {
    return this.belongsTo(Assessment);
  }

});
