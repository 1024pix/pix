const Bookshelf = require('../bookshelf');

require('./answer');
require('./assessment-result');
require('./knowledge-element');
require('./campaign-participation');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  assessmentResults() {
    return this.hasMany('AssessmentResult', 'assessmentId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'assessmentId');
  },
  campaignParticipation() {
    return this.hasOne('CampaignParticipation', 'assessmentId');
  },

});
