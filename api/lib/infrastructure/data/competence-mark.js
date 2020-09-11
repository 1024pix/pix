const Bookshelf = require('../bookshelf');
const CompetenceMark = require('../../domain/models/CompetenceMark');

require('./assessment-result');

const modelName = 'CompetenceMark';

module.exports = Bookshelf.model(modelName, {

  tableName: 'competence-marks',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  assessmentResults() {
    return this.belongsTo('AssessmentResult');
  },

  toDomainEntity() {
    const model = this.toJSON();
    return new CompetenceMark(model);
  },

}, {
  modelName,
});
