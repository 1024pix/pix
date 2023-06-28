import { Bookshelf } from '../bookshelf.js';
import { CompetenceMark } from '../../domain/models/CompetenceMark.js';

const modelName = 'CompetenceMark';

const BookshelfCompetenceMark = Bookshelf.model(
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

export { BookshelfCompetenceMark };
