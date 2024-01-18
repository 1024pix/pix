import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationChallengeForScoring } from '../../domain/models/CertificationChallengeForScoring.js';

export const getByCertificationCourseId = async ({ certificationCourseId }) => {
  const certificationChallengesForScoringDTO = await knex('certification-challenges')
    .select('challengeId', 'discriminant', 'difficulty')
    .where({ courseId: certificationCourseId });

  return _toDomain(certificationChallengesForScoringDTO);
};

function _toDomain(certificationChallengesForScoringDTO) {
  return certificationChallengesForScoringDTO.map((certificationChallengeForScoring) => {
    return new CertificationChallengeForScoring({
      ...certificationChallengeForScoring,
      id: certificationChallengeForScoring.challengeId,
    });
  });
}
