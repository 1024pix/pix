import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/CertificationCandidate.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CertificationAssessment } from '../../domain/models/CertificationAssessment.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { SessionManagement } from '../../domain/models/SessionManagement.js';

const get = async function ({ id }) {
  const foundSession = await knex.select('*').from('sessions').where({ id }).first();
  if (!foundSession) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return new SessionManagement({ ...foundSession });
};

const getVersion = async function ({ id }) {
  const result = await knex.select('version').from('sessions').where({ id }).first();
  if (!result) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return result.version;
};

const isFinalized = async function ({ id }) {
  const session = await knex.select('id').from('sessions').where({ id }).whereNotNull('finalizedAt').first();
  return Boolean(session);
};

const isPublished = async function ({ id }) {
  const isPublished = await knex.select(1).from('sessions').where({ id }).whereNotNull('publishedAt').first();
  return Boolean(isPublished);
};

const doesUserHaveCertificationCenterMembershipForSession = async function ({ userId, sessionId }) {
  const sessions = await knex
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

const finalize = async function ({ id, examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt }) {
  const [finalizedSession] = await knex('sessions')
    .where({ id })
    .update({ examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt })
    .returning('*');
  return new SessionManagement(finalizedSession);
};

const unfinalize = async function ({ id, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  const updates = await knexConn('sessions')
    .where({ id })
    .update({ finalizedAt: null, assignedCertificationOfficerId: null });
  if (updates === 0) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
};

const flagResultsAsSentToPrescriber = async function ({ id, resultsSentToPrescriberAt }) {
  const [flaggedSession] = await knex('sessions').where({ id }).update({ resultsSentToPrescriberAt }).returning('*');
  return new SessionManagement(flaggedSession);
};

const updatePublishedAt = async function ({ id, publishedAt }) {
  const [publishedSession] = await knex('sessions').where({ id }).update({ publishedAt }).returning('*');
  return new SessionManagement(publishedSession);
};

const hasSomeCleaAcquired = async function ({ id }) {
  const result = await knex
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
  const result = await knex.select(1).from('certification-courses').where('sessionId', id).first();
  return !result;
};

const countUncompletedCertificationsAssessment = async function ({ id }) {
  const { count } = await knex
    .count('certification-courses.id')
    .from('certification-courses')
    .join('assessments', 'certification-courses.id', 'certificationCourseId')
    .whereIn('state', CertificationAssessment.uncompletedAssessmentStates)
    .andWhere({ sessionId: id })
    .first();
  return count;
};

const getWithCertificationCandidates = async function ({ id }) {
  const session = await knex.from('sessions').where({ id }).first();

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const certificationCandidates = await knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-candidates')
    .leftJoin('certification-subscriptions', (builder) =>
      builder
        .on('certification-candidates.id', '=', 'certification-subscriptions.certificationCandidateId')
        .onNotNull('certification-subscriptions.complementaryCertificationId'),
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'certification-subscriptions.complementaryCertificationId',
    )
    .groupBy('certification-candidates.id', 'complementary-certifications.id')
    .where({ sessionId: id })
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

  return _toDomain({ ...session, certificationCandidates });
};

export {
  countUncompletedCertificationsAssessment,
  doesUserHaveCertificationCenterMembershipForSession,
  finalize,
  flagResultsAsSentToPrescriber,
  get,
  getVersion,
  getWithCertificationCandidates,
  hasNoStartedCertification,
  hasSomeCleaAcquired,
  isFinalized,
  isPublished,
  unfinalize,
  updatePublishedAt,
};

function _toDomain(results) {
  const toDomainCertificationCandidates = results.certificationCandidates
    .filter((candidateData) => candidateData != null)
    .map(
      (candidateData) =>
        new CertificationCandidate({
          ...candidateData,
          complementaryCertification: _buildComplementaryCertification({
            id: candidateData.complementaryCertificationId,
            key: candidateData.complementaryCertificationKey,
            label: candidateData.complementaryCertificationLabel,
          }),
        }),
    );

  return new SessionManagement({
    ...results,
    certificationCandidates: toDomainCertificationCandidates,
  });
}

function _buildComplementaryCertification({ id, key, label }) {
  if (!id) return null;
  return new ComplementaryCertification({
    id,
    key,
    label,
  });
}
