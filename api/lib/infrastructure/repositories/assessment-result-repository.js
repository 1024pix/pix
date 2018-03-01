const AssessmentResult = require('../../domain/models/AssessmentResult');
const BookshelfAssessmentResult = require('../data/assessment-result');

function _toDomain(bookshelfModel) {
  return new AssessmentResult(bookshelfModel.toJSON());
}

module.exports = {
  save: (assessmentResult) => {
    return new BookshelfAssessmentResult(assessmentResult)
      .save()
      .then(_toDomain);
  },

  get(id) {
    return BookshelfAssessmentResult
      .where('id', id)
      .fetch({ withRelated: ['competenceMarks'] })
      .then(_toDomain);
  }
};
