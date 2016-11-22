const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

require('./answer');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers: function () {
    return this.hasMany('Answer', 'assessmentId');
  }

});
