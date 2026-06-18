import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { SessionManagement } from '../../domain/models/SessionManagement.js';

const get = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const foundSession = await knexConn
    .select(
      'id',
      'accessCode',
      'address',
      'certificationCenter',
      'date',
      'description',
      'examiner',
      'room',
      'time',
      'examinerGlobalComment',
      'hasIncident',
      'hasJoiningIssue',
      'finalizedAt',
      'resultsSentToPrescriberAt',
      'publishedAt',
      'certificationCenterId',
      'assignedCertificationOfficerId',
      'createdBy',
    )
    .from('sessions')
    .where({ id })
    .first();
  if (!foundSession) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  const certificationCandidates = await knexConn
    .select('id', 'userId', 'reconciledAt', 'resultRecipientEmail')
    .from('certification-candidates')
    .groupBy('certification-candidates.id')
    .where({ sessionId: id })
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
  return new SessionManagement({ ...foundSession, certificationCandidates });
};

const isFinalized = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const session = await knexConn.select('id').from('sessions').where({ id }).whereNotNull('finalizedAt').first();
  return Boolean(session);
};

const isPublished = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const isPublished = await knexConn.select(1).from('sessions').where({ id }).whereNotNull('publishedAt').first();
  return Boolean(isPublished);
};

const doesUserHaveCertificationCenterMembershipForSession = async function ({ userId, sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessions = await knexConn
    .select('sessions.id')
    .from('sessions')
    .where({
      'sessions.id': sessionId,
      'certification-center-memberships.userId': userId,
      'certification-center-memberships.disabledAt': null,
    })
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .innerJoin(
      'certification-center-memberships',
      'certification-center-memberships.certificationCenterId',
      'certification-centers.id',
    );
  return Boolean(sessions.length);
};

const unfinalize = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const updates = await knexConn('sessions')
    .where({ id })
    .update({ finalizedAt: null, assignedCertificationOfficerId: null });
  if (updates === 0) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
};

const flagResultsAsSentToPrescriber = async function ({ id, resultsSentToPrescriberAt }) {
  const knexConn = DomainTransaction.getConnection();
  const [flaggedSession] = await knexConn('sessions')
    .where({ id })
    .update({ resultsSentToPrescriberAt })
    .returning('*');
  return new SessionManagement(flaggedSession);
};

const updatePublishedAt = async function ({ id, publishedAt }) {
  const knexConn = DomainTransaction.getConnection();
  const [publishedSession] = await knexConn('sessions').where({ id }).update({ publishedAt }).returning('*');
  return new SessionManagement(publishedSession);
};

const hasSomeCleaAcquired = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(1)
    .from('sessions')
    .innerJoin('certification-courses', 'certification-courses.sessionId', 'sessions.id')
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.certificationCourseId',
      'certification-courses.id',
    )
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .innerJoin(
      'complementary-certification-course-results',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-courses.id',
    )
    .where('sessions.id', id)
    .whereNotNull('sessions.publishedAt')
    .where('complementary-certification-course-results.acquired', true)
    .where('complementary-certifications.key', ComplementaryCertificationKeys.CLEA)
    .first();
  return Boolean(result);
};

const hasNoStartedCertification = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn.select(1).from('certification-courses').where('sessionId', id).first();
  return !result;
};

export {
  doesUserHaveCertificationCenterMembershipForSession,
  flagResultsAsSentToPrescriber,
  get,
  hasNoStartedCertification,
  hasSomeCleaAcquired,
  isFinalized,
  isPublished,
  unfinalize,
  updatePublishedAt,
};
