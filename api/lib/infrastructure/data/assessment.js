const Bookshelf = require('../bookshelf');

require('./answer');
require('./assessment-result');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  assessmentResults() {
    return this.hasMany('AssessmentResults', 'assessmentId');
  },

});
