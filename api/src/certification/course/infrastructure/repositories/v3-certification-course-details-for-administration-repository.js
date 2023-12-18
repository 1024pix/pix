import { knex } from '../../../../../db/knex-database-connection.js';
import { V3CertificationChallengeForAdministration } from '../../domain/models/V3CertificationChallengeForAdministration.js';
import { V3CertificationCourseDetailsForAdministration } from '../../domain/models/V3CertificationCourseDetailsForAdministration.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';

const getV3DetailsByCertificationCourseId = async function ({ certificationCourseId }) {
  const certificationChallengesDetailsDTO = await knex('assessments')
    .select({ challengeId: 'certification-challenges.challengeId', answerStatus: 'answers.result' })
    .leftJoin('certification-challenges', 'certification-challenges.courseId', 'assessments.certificationCourseId')
    .leftJoin('answers', function () {
      this.on({ 'answers.assessmentId': 'assessments.id' }).andOn({
        'answers.challengeId': 'certification-challenges.challengeId',
      });
    })
    .where({
      certificationCourseId,
    });
  return _toDomain({ certificationChallengesDetailsDTO, certificationCourseId });
};

function _toDomain({ certificationChallengesDetailsDTO, certificationCourseId }) {
  const certificationChallengesForAdministration = certificationChallengesDetailsDTO.map(
    (certificationChallengeDetailsDTO) =>
      new V3CertificationChallengeForAdministration({
        ...certificationChallengeDetailsDTO,
        answerStatus: new AnswerStatus({ status: certificationChallengeDetailsDTO.answerStatus }),
      }),
  );

  return new V3CertificationCourseDetailsForAdministration({
    certificationCourseId,
    certificationChallengesForAdministration,
  });
}

export { getV3DetailsByCertificationCourseId };
