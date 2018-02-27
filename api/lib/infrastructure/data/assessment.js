const Bookshelf = require('../bookshelf');

require('./answer');
require('./assessment-results');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  assessmentResults() {
    return this.hasMany('AssessmentResult', 'assessmentId');
  },

});
