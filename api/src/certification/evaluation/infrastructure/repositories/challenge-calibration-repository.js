import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ChallengeCalibration } from '../../domain/read-models/ChallengeCalibration.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @returns {Promise<Array<ChallengeCalibration>>}
 */
export async function getByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const challengeCalibrations = await knexConn('certification-challenges')
    .select({
      challengeId: 'challengeId',
      discriminant: 'discriminant',
      difficulty: 'difficulty',
      certificationChallengeId: 'id',
    })
    .where({ courseId: certificationCourseId })
    .orderBy('createdAt', 'asc');

  return _toDomain(challengeCalibrations);
}

/**
 * @param {Array<object>} challengeCalibrations
 * @returns {Array<ChallengeCalibration>}
 */
function _toDomain(challengeCalibrations) {
  return challengeCalibrations.map((challengeCalibration) => {
    return new ChallengeCalibration({
      ...challengeCalibration,
      id: challengeCalibration.challengeId,
    });
  });
}
