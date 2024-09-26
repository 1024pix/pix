import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCandidate } from '../../../../shared/domain/models/index.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { Subscription } from '../../domain/models/Subscription.js';

const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const certificationCandidate = await _candidateBaseQuery().where({ sessionId, userId }).first();
  return certificationCandidate ? _toDomain(certificationCandidate) : undefined;
};

const findBySessionId = async function (sessionId) {
  const results = await _candidateBaseQuery()
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

const update = async function (certificationCandidate) {
  const result = await knex('certification-candidates')
    .where({ id: certificationCandidate.id })
    .update({ authorizedToStart: certificationCandidate.authorizedToStart });

  if (result === 0) {
    throw new NotFoundError('Aucun candidat trouvé');
  }
};

const getWithComplementaryCertification = async function ({ id }) {
  const candidateData = await _candidateBaseQuery().where('certification-candidates.id', id).first();

  if (!candidateData) {
    throw new NotFoundError('Candidate not found');
  }

  return _toDomain(candidateData);
};

export { findBySessionId, getBySessionIdAndUserId, getWithComplementaryCertification, update };

/**
 * @deprecated migration: new ComplementaryCertification(...) should not be done here
 * it should come from internal API complementary-certification bounded context.
 * Please beware of that when refactoring this code in the future
 */
function _toDomain(candidateData) {
  return new CertificationCandidate({
    ...candidateData,
    subscriptions: [Subscription.buildCore({ id: candidateData.certificationCandidateId })],
    complementaryCertification: candidateData.complementaryCertificationId
      ? new ComplementaryCertification({
          id: candidateData.complementaryCertificationId,
          key: candidateData.complementaryCertificationKey,
          label: candidateData.complementaryCertificationLabel,
        })
      : null,
  });
}

function _candidateBaseQuery() {
  return knex
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
      'certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .groupBy('certification-candidates.id', 'complementary-certifications.id');
}
