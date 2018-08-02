const Bookshelf = require('../bookshelf');

require('./answer');
require('./assessment-result');
require('./knowledge-element');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  assessmentResults() {
    return this.hasMany('AssessmentResults', 'assessmentId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'assessmentId');
  },
});
