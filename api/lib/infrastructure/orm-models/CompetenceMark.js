import Bookshelf from '../bookshelf';
import CompetenceMark from '../../domain/models/CompetenceMark';

const modelName = 'CompetenceMark';

export default Bookshelf.model(
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
