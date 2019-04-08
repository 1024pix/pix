const BookshelfCompetenceEvaluation = require('../data/competence-evaluation');
const CompetenceEvaluation = require('../../domain/models/CompetenceEvaluation');

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
};
