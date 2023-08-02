import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { BookshelfCompetenceEvaluation } from '../orm-models/CompetenceEvaluation.js';
import _ from 'lodash';
import { NotFoundError } from '../../domain/errors.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';
import { CompetenceEvaluation } from '../../domain/models/CompetenceEvaluation.js';
import { Assessment } from '../../domain/models/Assessment.js';

const save = async function ({ competenceEvaluation, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const foundCompetenceEvaluation = await _getByCompetenceIdAndUserId({
    competenceId: competenceEvaluation.competenceId,
    userId: competenceEvaluation.userId,
    knexConn,
  });

  if (foundCompetenceEvaluation) {
    return foundCompetenceEvaluation;
  }

  const competenceEvaluationToSave = _.omit(competenceEvaluation, ['assessment', 'scorecard']);
  const [competenceEvaluationCreated] = await knexConn('competence-evaluations')
    .insert(competenceEvaluationToSave)
    .returning('*');

  return _toDomain({ competenceEvaluation: competenceEvaluationCreated, assessment: null });
};

const updateStatusByAssessmentId = function ({ assessmentId, status }) {
  return BookshelfCompetenceEvaluation.where({ assessmentId })
    .save({ status }, { require: true, patch: true })
    .then((updatedCompetenceEvaluation) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation),
    );
};

const updateStatusByUserIdAndCompetenceId = function ({ userId, competenceId, status }) {
  return BookshelfCompetenceEvaluation.where({ userId, competenceId })
    .save({ status }, { require: true, patch: true })
    .then((updatedCompetenceEvaluation) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation),
    );
};

const updateAssessmentId = function ({
  currentAssessmentId,
  newAssessmentId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  return BookshelfCompetenceEvaluation.where({ assessmentId: currentAssessmentId })
    .save(
      { assessmentId: newAssessmentId },
      { require: true, patch: true, transacting: domainTransaction.knexTransaction },
    )
    .then((updatedCompetenceEvaluation) =>
      bookshelfToDomainConverter.buildDomainObject(BookshelfCompetenceEvaluation, updatedCompetenceEvaluation),
    );
};

const getByAssessmentId = async function (assessmentId) {
  const competenceEvaluation = await knex('competence-evaluations').where({ assessmentId }).first();
  if (!competenceEvaluation) {
    throw new NotFoundError();
  }

  const assessment = await knex('assessments').where({ id: competenceEvaluation.assessmentId }).first();

  return _toDomain({ competenceEvaluation, assessment });
};

const getByCompetenceIdAndUserId = async function ({
  competenceId,
  userId,
  domainTransaction = DomainTransaction.emptyTransaction(),
  forUpdate = false,
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const competenceEvaluation = await _getByCompetenceIdAndUserId({
    competenceId,
    userId,
    knexConn,
    forUpdate,
  });
  if (competenceEvaluation === null) {
    throw new NotFoundError();
  }
  return competenceEvaluation;
};

const findByUserId = async function (userId) {
  const competenceEvaluations = await knex('competence-evaluations').where({ userId }).orderBy('createdAt', 'asc');
  const assessments = await knex('assessments').whereIn(
    'id',
    competenceEvaluations.map((competenceEvaluation) => competenceEvaluation.assessmentId),
  );

  const domainCompetenceEvaluations = competenceEvaluations.map((competenceEvaluation) =>
    _toDomain({
      competenceEvaluation,
      assessment: assessments.find((assessment) => assessment.id === competenceEvaluation.assessmentId),
    }),
  );

  return _selectOnlyOneCompetenceEvaluationByCompetence(domainCompetenceEvaluations);
};

const findByAssessmentId = function (assessmentId) {
  return BookshelfCompetenceEvaluation.where({ assessmentId })
    .orderBy('createdAt', 'asc')
    .fetchAll()
    .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCompetenceEvaluation, results));
};

const existsByCompetenceIdAndUserId = async function ({ competenceId, userId }) {
  const competenceEvaluation = await _getByCompetenceIdAndUserId({ competenceId, userId });
  return competenceEvaluation ? true : false;
};

export {
  save,
  updateStatusByAssessmentId,
  updateStatusByUserIdAndCompetenceId,
  updateAssessmentId,
  getByAssessmentId,
  getByCompetenceIdAndUserId,
  findByUserId,
  findByAssessmentId,
  existsByCompetenceIdAndUserId,
};

async function _getByCompetenceIdAndUserId({ competenceId, userId, forUpdate = false, knexConn }) {
  const query = knexConn('competence-evaluations').where({ competenceId, userId }).orderBy('createdAt', 'asc').first();
  if (forUpdate) {
    query.forUpdate();
  }

  const competenceEvaluation = await query;

  if (!competenceEvaluation) {
    return null;
  }

  const assessment = await knexConn('assessments').where({ id: competenceEvaluation.assessmentId }).first();

  return _toDomain({ competenceEvaluation, assessment });
}

function _selectOnlyOneCompetenceEvaluationByCompetence(competenceEvaluations) {
  const assessmentsGroupedByCompetence = _.groupBy(competenceEvaluations, 'competenceId');
  return _.map(assessmentsGroupedByCompetence, _.head);
}

function _toDomain({ competenceEvaluation, assessment }) {
  return new CompetenceEvaluation({
    ...competenceEvaluation,
    assessment: assessment != null ? new Assessment(assessment) : undefined,
  });
}
