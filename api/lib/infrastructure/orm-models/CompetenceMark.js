const Bookshelf = require('../bookshelf.js');
const CompetenceMark = require('../../domain/models/CompetenceMark.js');

const modelName = 'CompetenceMark';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'competence-marks',
    hasTimestamps: ['createdAt', null],

    assessmentResults() {
      return this.belongsTo('AssessmentResult');
    },

    toDomainEntity() {
      const model = this.toJSON();
      return new CompetenceMark(model);
    },
  },
  {
    modelName,
  }
);
