import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCandidate } from '../../domain/models/CertificationCandidate.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {number} params.userId
 * @returns {Promise<CertificationCandidate | undefined>}
 */
const getBySessionIdAndUserId = async function ({ sessionId, userId }) {
  const candidateData = await candidateBaseQuery().where({ sessionId, userId });
  if (candidateData.length === 0) {
    return undefined;
  }
  return toDomain(candidateData);
};

const findBySessionId = async function (sessionId) {
  const candidatesData = await candidateBaseQuery()
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');

  if (candidatesData.length === 0) {
    return [];
  }

  const candidatesDataByCandidate = new Map();

  for (const candidateData of candidatesData) {
    if (!candidatesDataByCandidate.has(candidateData.id)) {
      candidatesDataByCandidate.set(candidateData.id, []);
    }
    candidatesDataByCandidate.get(candidateData.id).push(candidateData);
  }

  return Array.from(candidatesDataByCandidate.values(), toDomain);
};

const update = async function (certificationCandidate) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('certification-candidates')
    .where({ id: certificationCandidate.id })
    .update({ authorizedToStart: certificationCandidate.authorizedToStart });

  if (result === 0) {
    throw new NotFoundError('Aucun candidat trouvé');
  }
};

export { findBySessionId, getBySessionIdAndUserId, update };

function toDomain(candidateData) {
  return new CertificationCandidate({
    ...candidateData[0],
  });
}

function candidateBaseQuery() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select({
      id: 'certification-candidates.id',
      firstName: 'certification-candidates.firstName',
      lastName: 'certification-candidates.lastName',
      sex: 'certification-candidates.sex',
      birthPostalCode: 'certification-candidates.birthPostalCode',
      birthINSEECode: 'certification-candidates.birthINSEECode',
      birthCity: 'certification-candidates.birthCity',
      birthProvinceCode: 'certification-candidates.birthProvinceCode',
      birthCountry: 'certification-candidates.birthCountry',
      email: 'certification-candidates.email',
      resultRecipientEmail: 'certification-candidates.resultRecipientEmail',
      externalId: 'certification-candidates.externalId',
      birthdate: 'certification-candidates.birthdate',
      extraTimePercentage: 'certification-candidates.extraTimePercentage',
      createdAt: 'certification-candidates.createdAt',
      authorizedToStart: 'certification-candidates.authorizedToStart',
      sessionId: 'certification-candidates.sessionId',
      userId: 'certification-candidates.userId',
      organizationLearnerId: 'certification-candidates.organizationLearnerId',
      billingMode: 'certification-candidates.billingMode',
      prepaymentCode: 'certification-candidates.prepaymentCode',
      hasSeenCertificationInstructions: 'certification-candidates.hasSeenCertificationInstructions',
      accessibilityAdjustmentNeeded: 'certification-candidates.accessibilityAdjustmentNeeded',
      reconciledAt: 'certification-candidates.reconciledAt',
      subscription: 'certification-candidates.subscription',
    })
    .from('certification-candidates');
}
