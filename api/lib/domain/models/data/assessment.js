const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

require('./answer');
require('./mark');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  marks() {
    return this.hasMany('Mark', 'assessmentId');
  }

});
