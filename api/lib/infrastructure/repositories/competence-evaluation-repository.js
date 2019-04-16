const BookshelfCompetenceEvaluation = require('../data/competence-evaluation');
const CompetenceEvaluation = require('../../domain/models/CompetenceEvaluation');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfCompetenceEvaluation) {
  return new CompetenceEvaluation({
    id: bookshelfCompetenceEvaluation.get('id'),
    assessmentId: bookshelfCompetenceEvaluation.get('assessmentId'),
    competenceId: bookshelfCompetenceEvaluation.get('competenceId'),
    createdAt: new Date(bookshelfCompetenceEvaluation.get('createdAt')),
    updatedAt: new Date(bookshelfCompetenceEvaluation.get('updatedAt')),
    userId: bookshelfCompetenceEvaluation.get('userId'),
  });
}

module.exports = {

  save(competenceEvaluation) {
    return new BookshelfCompetenceEvaluation(competenceEvaluation)
      .save()
      .then(_toDomain);
  },

  getByAssessmentId(assessmentId) {
    return BookshelfCompetenceEvaluation
      .where({ assessmentId })
      .fetch({ require: true })
      .then(_toDomain)
      .catch((bookshelfError) => {
        if (bookshelfError instanceof BookshelfCompetenceEvaluation.NotFoundError) {
          throw new NotFoundError();
        }
        throw bookshelfError;
      });
  },

  getLastByCompetenceIdAndUserId(competenceId, userId) {
    return BookshelfCompetenceEvaluation
      .where({ competenceId, userId })
      .orderBy('createdAt', 'desc')
      .query((qb) => qb.limit(1))
      .fetch({ require: true })
      .then(_toDomain)
      .catch((bookshelfError) => {
        if (bookshelfError instanceof BookshelfCompetenceEvaluation.NotFoundError) {
          throw new NotFoundError();
        }
        throw bookshelfError;
      });
  },
};
