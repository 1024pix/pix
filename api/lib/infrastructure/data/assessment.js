const Bookshelf = require('../bookshelf');

require('./answer');
require('./correction');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  corrections() {
    return this.hasMany('Correction', 'assessmentId');
  },

});
