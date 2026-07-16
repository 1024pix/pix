import { PGSQL_FOREIGN_KEY_VIOLATION_ERROR } from '../../../../../db/pgsql-errors.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CertificationAssessment } from '../../domain/models/CertificationAssessment.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';
import { JurySession, statuses } from '../../domain/models/JurySession.js';
import { JurySessionCounters } from '../../domain/read-models/JurySessionCounters.js';

const COLUMNS = Object.freeze([
  'sessions.*',
  'certification-centers.type',
  'certification-centers.externalId',
  'users.firstName',
  'users.lastName',
]);
const ALIASED_COLUMNS = Object.freeze({
  juryCommentAuthorFirstName: 'jury-comment-authors.firstName',
  juryCommentAuthorLastName: 'jury-comment-authors.lastName',
});

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const jurySessionDTO = await knexConn
    .select(COLUMNS)
    .select(ALIASED_COLUMNS)
    .from('sessions')
    .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId')
    .leftJoin({ 'jury-comment-authors': 'users' }, 'jury-comment-authors.id', 'sessions.juryCommentAuthorId')
    .where('sessions.id', '=', id)
    .first();
  if (!jurySessionDTO) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const sessionCounters = await getCounters({ sessionId: id });

  return _toDomain(jurySessionDTO, sessionCounters);
}

export async function findPaginatedFiltered({ filters, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .select(COLUMNS)
    .select(ALIASED_COLUMNS)
    .from('sessions')
    .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId')
    .leftJoin({ 'jury-comment-authors': 'users' }, 'jury-comment-authors.id', 'sessions.juryCommentAuthorId')
    .modify(_setupFilters, filters)
    .orderByRaw('?? ASC NULLS FIRST', 'publishedAt')
    .orderByRaw('?? ASC', 'finalizedAt')
    .orderBy('id');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  const jurySessions = results.map(_toDomain);

  return {
    jurySessions,
    pagination,
  };
}

export async function getCounters({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();

  const { startedCertifications } = await knexConn
    .from('certification-courses')
    .innerJoin('assessments', 'certification-courses.id', 'assessments.certificationCourseId')
    .where('assessments.state', '=', CertificationAssessment.states.STARTED)
    .andWhere('certification-courses.sessionId', '=', sessionId)
    .count('assessments.state as startedCertifications')
    .first();

  const { certificationsWithScoringError } = await knexConn
    .from('certification-courses')
    .innerJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .innerJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where('certification-courses.sessionId', '=', sessionId)
    .andWhere('assessment-results.status', '=', AssessmentResult.status.ERROR)
    .count('assessment-results.id as certificationsWithScoringError')
    .first();

  const issueReports = await knexConn
    .from('certification-courses')
    .innerJoin(
      'certification-issue-reports',
      'certification-courses.id',
      'certification-issue-reports.certificationCourseId',
    )
    .where('certification-courses.sessionId', '=', sessionId)
    .select(
      'certification-issue-reports.category',
      'certification-issue-reports.subcategory',
      'certification-issue-reports.resolvedAt',
    );

  return _toJurySessionCountersDomainModel({ startedCertifications, certificationsWithScoringError, issueReports });
}

const _toJurySessionCountersDomainModel = ({ startedCertifications, certificationsWithScoringError, issueReports }) => {
  return new JurySessionCounters({ startedCertifications, certificationsWithScoringError, issueReports });
};

export async function assignCertificationOfficer({ id, assignedCertificationOfficerId }) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const updatedLines = await knexConn('sessions').where({ id }).update({ assignedCertificationOfficerId });
    if (updatedLines === 0) {
      throw new NotFoundError(`La session d'id ${id} n'existe pas.`);
    }
  } catch (error) {
    if (error.code === PGSQL_FOREIGN_KEY_VIOLATION_ERROR) {
      throw new NotFoundError(`L'utilisateur d'id ${assignedCertificationOfficerId} n'existe pas`);
    }
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error(error);
  }
}

function _toDomain(jurySessionFromDB, counters) {
  let assignedCertificationOfficer = null;
  if (jurySessionFromDB.assignedCertificationOfficerId) {
    assignedCertificationOfficer = new CertificationOfficer({
      id: jurySessionFromDB.assignedCertificationOfficerId,
      firstName: jurySessionFromDB.firstName,
      lastName: jurySessionFromDB.lastName,
    });
  }

  let juryCommentAuthor = null;
  if (jurySessionFromDB.juryCommentAuthorId) {
    juryCommentAuthor = new CertificationOfficer({
      id: jurySessionFromDB.juryCommentAuthorId,
      firstName: jurySessionFromDB.juryCommentAuthorFirstName,
      lastName: jurySessionFromDB.juryCommentAuthorLastName,
    });
  }

  const jurySession = new JurySession({
    ...jurySessionFromDB,
    certificationCenterName: jurySessionFromDB.certificationCenter,
    certificationCenterType: jurySessionFromDB.type,
    certificationCenterExternalId: jurySessionFromDB.externalId,
    assignedCertificationOfficer,
    juryCommentAuthor,
    counters,
  });

  return jurySession;
}

function _setupFilters(query, filters) {
  const { ids, certificationCenterName, status, certificationCenterExternalId, certificationCenterType, version } =
    filters;

  if (ids) {
    query.whereIn('sessions.id', ids);
  }

  if (certificationCenterName) {
    query.whereILike('certificationCenter', `%${certificationCenterName}%`);
  }

  if (certificationCenterType) {
    query.where('certification-centers.type', certificationCenterType);
  }

  if (certificationCenterExternalId) {
    query.whereRaw('LOWER(??) LIKE ?', [
      'certification-centers.externalId',
      '%' + certificationCenterExternalId.toLowerCase() + '%',
    ]);
  }

  if (version) {
    query.where('sessions.version', version);
  }

  if (status === statuses.CREATED) {
    query.whereNull('finalizedAt');
    query.whereNull('publishedAt');
  }
  if (status === statuses.FINALIZED) {
    query.whereNotNull('finalizedAt');
    query.whereNull('assignedCertificationOfficerId');
    query.whereNull('publishedAt');
  }
  if (status === statuses.IN_PROCESS) {
    query.whereNotNull('finalizedAt');
    query.whereNotNull('assignedCertificationOfficerId');
    query.whereNull('publishedAt');
  }
  if (status === statuses.PROCESSED) {
    query.whereNotNull('publishedAt');
  }
}
