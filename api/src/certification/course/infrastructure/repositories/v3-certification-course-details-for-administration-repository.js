import { knex } from '../../../../../db/knex-database-connection.js';
import { V3CertificationChallengeForAdministration } from '../../domain/models/V3CertificationChallengeForAdministration.js';
import { V3CertificationCourseDetailsForAdministration } from '../../domain/models/V3CertificationCourseDetailsForAdministration.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../domain/models/V3CertificationChallengeLiveAlertForAdministration.js';
import { CertificationChallengeLiveAlertStatus } from '../../../session/domain/models/CertificationChallengeLiveAlert.js';

const getV3DetailsByCertificationCourseId = async function ({ certificationCourseId }) {
  const certificationChallengesDetailsDTO = await knex
    .with('validated-live-alerts', (queryBuilder) => {
      queryBuilder
        .select('*')
        .from('certification-challenge-live-alerts')
        .where({ status: CertificationChallengeLiveAlertStatus.VALIDATED });
    })
    .select({
      challengeId: 'certification-challenges.challengeId',
      answerStatus: 'answers.result',
      liveAlertId: 'validated-live-alerts.id',
      answeredAt: 'answers.createdAt',
    })
    .from('assessments')
    .leftJoin('certification-challenges', 'certification-challenges.courseId', 'assessments.certificationCourseId')
    .leftJoin('answers', function () {
      this.on({ 'answers.assessmentId': 'assessments.id' }).andOn({
        'answers.challengeId': 'certification-challenges.challengeId',
      });
    })
    .leftJoin('validated-live-alerts', function () {
      this.on({ 'validated-live-alerts.assessmentId': 'assessments.id' }).andOn({
        'validated-live-alerts.challengeId': 'certification-challenges.challengeId',
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
        validatedLiveAlert: certificationChallengeDetailsDTO.liveAlertId
          ? new V3CertificationChallengeLiveAlertForAdministration({
              id: certificationChallengeDetailsDTO.liveAlertId,
            })
          : undefined,
      }),
  );

  return new V3CertificationCourseDetailsForAdministration({
    certificationCourseId,
    certificationChallengesForAdministration,
  });
}

export { getV3DetailsByCertificationCourseId };
