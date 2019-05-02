const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfCompetenceEvaluation = require('../data/competence-evaluation');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  save(competenceEvaluation) {
    return new BookshelfCompetenceEvaluation(_.omit(competenceEvaluation, ['assessment']))
      .save()
      .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result));
  },

  getByAssessmentId(assessmentId) {
    return BookshelfCompetenceEvaluation
      .where({ assessmentId })
      .fetch({ require: true, withRelated: ['assessment'] })
      .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result))
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
      .fetch({ require: true, withRelated: ['assessment'] })
      .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result))
      .catch((bookshelfError) => {
        if (bookshelfError instanceof BookshelfCompetenceEvaluation.NotFoundError) {
          throw new NotFoundError();
        }
        throw bookshelfError;
      });
  },

  findByUserId(userId) {
    return BookshelfCompetenceEvaluation
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .fetchAll({ withRelated: ['assessment'] })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCompetenceEvaluation, results));
  },
};
