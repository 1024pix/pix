import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Subscription } from '../../../enrolment/domain/models/Subscription.js';
import { CertificationCandidate } from '../../../shared/domain/models/CertificationCandidate.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {number} params.userId
 * @returns {Promise<CertificationCandidate | undefined>}
 */

const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const candidateData = await _candidateBaseQuery().where({ sessionId, userId }).first();
  const subscriptionData = candidateData ? await _getSubscriptions(candidateData.id) : undefined;
  return candidateData ? _toDomain({ candidateData, subscriptionData }) : undefined;
};

const findBySessionId = async function (sessionId) {
  const certificationCandidates = await _candidateBaseQuery()
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');

  const result = [];

  for (const candidateData of certificationCandidates) {
    const subscriptions = await _getSubscriptions(candidateData.id);
    const certificationCandidate = _toDomain({ candidateData, subscriptions });

    result.push(certificationCandidate);
  }

  return result;
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

  const subscriptionData = await _getSubscriptions(id);

  if (!candidateData) {
    throw new NotFoundError('Candidate not found');
  }

  return _toDomain({ candidateData, subscriptionData });
};

export { findBySessionId, getBySessionIdAndUserId, getWithComplementaryCertification, update };

function _toDomain({ candidateData, subscriptionData }) {
  const subscriptions = subscriptionData?.map((subscription) => new Subscription({ ...subscription }));
  return new CertificationCandidate({
    ...candidateData,
    subscriptions,
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
      complementaryCertificationLabel: 'complementary-certifications.label',
      complementaryCertificationKey: 'complementary-certifications.key',
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

async function _getSubscriptions(candidateId) {
  return knex
    .select(
      'certification-subscriptions.complementaryCertificationId',
      'certification-subscriptions.certificationCandidateId',
      'certification-subscriptions.type',
      'complementary-certifications.key as complementaryCertificationKey',
    )
    .from('certification-subscriptions')
    .where('certificationCandidateId', candidateId)
    .leftJoin(
      'complementary-certifications',
      'certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    );
}
