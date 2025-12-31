// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {import('../../../scoring/domain/models/CertificationAssessmentHistory.js').CertificationAssessmentHistory} CertificationAssessmentHistory
 */

/**
 * @function
 * @param {CertificationAssessmentHistory} certificationChallengeHistory
 * @returns {Promise<void>}
 */
export const save = async (certificationChallengeHistory) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-challenge-capacities')
    .insert(certificationChallengeHistory.capacityHistory)
    .onConflict('certificationChallengeId')
    .merge();
};
