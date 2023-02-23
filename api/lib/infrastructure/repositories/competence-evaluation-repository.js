const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const BookshelfCompetenceEvaluation = require('../orm-models/CompetenceEvaluation.js');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

module.exports = {
  async save({ competenceEvaluation, domainTransaction = DomainTransaction.emptyTransaction() }) {
    let competenceEvaluationCreated = await _getByCompetenceIdAndUserId({
      competenceId: competenceEvaluation.competenceId,
      userId: competenceEvaluation.userId,
      domainTransaction,
    });
    if (competenceEvaluationCreated) {
      return competenceEvaluationCreated;
    } else {
      competenceEvaluationCreated = await new BookshelfCompetenceEvaluation(
        _.omit(competenceEvaluation, ['assessment', 'scorecard'])
      )
        .save(null, { transacting: domainTransaction.knexTransaction })
        .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result));
    }
    return competenceEvaluationCreated;
  },

  updateStatusByAssessmentId({ assessmentId, status }) {
    return BookshelfCompetenceEvaluation.where({ assessmentId })
      .save({ status }, { require: true, patch: true })
      .then((updatedCompetenceEvaluation) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation)
      );
  },

  updateStatusByUserIdAndCompetenceId({ userId, competenceId, status }) {
    return BookshelfCompetenceEvaluation.where({ userId, competenceId })
      .save({ status }, { require: true, patch: true })
      .then((updatedCompetenceEvaluation) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation)
      );
  },

  updateAssessmentId({
    currentAssessmentId,
    newAssessmentId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    return BookshelfCompetenceEvaluation.where({ assessmentId: currentAssessmentId })
      .save(
        { assessmentId: newAssessmentId },
        { require: true, patch: true, transacting: domainTransaction.knexTransaction }
      )
      .then((updatedCompetenceEvaluation) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation)
      );
  },

  getByAssessmentId(assessmentId) {
    return BookshelfCompetenceEvaluation.where({ assessmentId })
      .orderBy('createdAt', 'asc')
      .fetch({ withRelated: ['assessment'] })
      .then((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result))
      .catch((bookshelfError) => {
        if (bookshelfError instanceof BookshelfCompetenceEvaluation.NotFoundError) {
          throw new NotFoundError();
        }
        throw bookshelfError;
      });
  },

  async getByCompetenceIdAndUserId({
    competenceId,
    userId,
    domainTransaction = DomainTransaction.emptyTransaction(),
    forUpdate = false,
  }) {
    const competenceEvaluation = await _getByCompetenceIdAndUserId({
      competenceId,
      userId,
      domainTransaction,
      forUpdate,
    });
    if (competenceEvaluation === null) {
      throw new NotFoundError();
    }
    return competenceEvaluation;
  },

  findByUserId(userId) {
    return BookshelfCompetenceEvaluation.where({ userId })
      .orderBy('createdAt', 'asc')
      .fetchAll({ withRelated: ['assessment'] })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCompetenceEvaluation, results))
      .then(_selectOnlyOneCompetenceEvaluationByCompetence);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfCompetenceEvaluation.where({ assessmentId })
      .orderBy('createdAt', 'asc')
      .fetchAll()
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCompetenceEvaluation, results));
  },

  async existsByCompetenceIdAndUserId({ competenceId, userId }) {
    const competenceEvaluation = await _getByCompetenceIdAndUserId({ competenceId, userId });
    return competenceEvaluation ? true : false;
  },
};

async function _getByCompetenceIdAndUserId({
  competenceId,
  userId,
  domainTransaction = DomainTransaction.emptyTransaction(),
  forUpdate = false,
}) {
  try {
    const result = await BookshelfCompetenceEvaluation.where({ competenceId, userId })
      .orderBy('createdAt', 'asc')
      .fetch({
        transacting: domainTransaction.knexTransaction,
        lock: forUpdate ? 'forUpdate' : undefined,
      });

    await result.related('assessment').fetch();

    return bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, result);
  } catch (bookshelfError) {
    if (bookshelfError instanceof BookshelfCompetenceEvaluation.NotFoundError) {
      return null;
    }
    throw bookshelfError;
  }
}

function _selectOnlyOneCompetenceEvaluationByCompetence(competenceEvaluations) {
  const assessmentsGroupedByCompetence = _.groupBy(competenceEvaluations, 'competenceId');
  return _.map(assessmentsGroupedByCompetence, _.head);
}
