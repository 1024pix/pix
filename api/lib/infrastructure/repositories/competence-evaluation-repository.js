const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfCompetenceEvaluation = require('../data/competence-evaluation');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');

module.exports = {

  save(competenceEvaluation) {
    return new BookshelfCompetenceEvaluation(_.omit(competenceEvaluation, ['assessment', 'scorecard']))
      .save()
      .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result));
  },

  updateStatusByAssessmentId({ assessmentId, status }) {
    return BookshelfCompetenceEvaluation
      .where({ assessmentId })
      .save({ status }, { require: true, patch: true })
      .then((updatedCompetenceEvaluation) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation));
  },

  updateStatusByUserIdAndCompetenceId({ userId, competenceId, status }) {
    return BookshelfCompetenceEvaluation
      .where({ userId, competenceId })
      .save({ status }, { require: true, patch: true })
      .then((updatedCompetenceEvaluation) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation));
  },

  updateAssessmentId({ currentAssessmentId, newAssessmentId }) {
    return BookshelfCompetenceEvaluation
      .where({ assessmentId: currentAssessmentId })
      .save({ assessmentId: newAssessmentId }, { require: true, patch: true })
      .then((updatedCompetenceEvaluation) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation));

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

  getByCompetenceIdAndUserId({ competenceId, userId }) {
    return BookshelfCompetenceEvaluation
      .where({ competenceId, userId })
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

  find(options) {
    return queryBuilder.find(BookshelfCompetenceEvaluation, options);
  },

  async existsByCompetenceIdAndUserId({ competenceId, userId }) {
    let isCompetenceEvaluationExists = true;
    try {
      await this.getByCompetenceIdAndUserId({ competenceId, userId });
    } catch (err) {
      if (err instanceof NotFoundError) {
        isCompetenceEvaluationExists = false;
      } else {
        throw err;
      }
    }

    return isCompetenceEvaluationExists;
  },
};
