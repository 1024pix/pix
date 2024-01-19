import { knex } from '../../../../../db/knex-database-connection.js';
import { V3CertificationChallengeForAdministration } from '../../domain/models/V3CertificationChallengeForAdministration.js';
import { V3CertificationCourseDetailsForAdministration } from '../../domain/models/V3CertificationCourseDetailsForAdministration.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../domain/models/V3CertificationChallengeLiveAlertForAdministration.js';
import { CertificationChallengeLiveAlertStatus } from '../../../session/domain/models/CertificationChallengeLiveAlert.js';

const getV3DetailsByCertificationCourseId = async function ({ certificationCourseId }) {
  const liveAlertsDTO = await knex
    .with('validated-live-alerts', (queryBuilder) => {
      queryBuilder
        .select('*')
        .from('certification-challenge-live-alerts')
        .where({ status: CertificationChallengeLiveAlertStatus.VALIDATED });
    })
    .select({
      id: 'validated-live-alerts.id',
      challengeId: 'validated-live-alerts.challengeId',
      issueReportSubcategory: 'certification-issue-reports.subcategory',
    })
    .from('assessments')
    .leftJoin('validated-live-alerts', 'validated-live-alerts.assessmentId', 'assessments.id')
    .leftJoin('certification-issue-reports', 'certification-issue-reports.liveAlertId', 'validated-live-alerts.id')
    .where({ 'assessments.certificationCourseId': certificationCourseId })
    .orderBy('validated-live-alerts.createdAt', 'ASC');

  const certificationCourseDTO = await knex
    .select({
      isRejectedForFraud: 'certification-courses.isRejectedForFraud',
      certificationCourseId: 'certification-courses.id',
      createdAt: 'certification-courses.createdAt',
      completedAt: 'certification-courses.completedAt',
      abortReason: 'certification-courses.abortReason',
      assessmentState: 'assessments.state',
      isCancelled: 'certification-courses.isCancelled',
      assessmentResultStatus: 'assessment-results.status',
      pixScore: 'assessment-results.pixScore',
    })
    .from('certification-courses')
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessments.id', 'assessment-results.assessmentId')
    .where({
      'certification-courses.id': certificationCourseId,
    })
    .first();

  const certificationChallengesDetailsDTO = await knex
    .select({
      challengeId: 'certification-challenges.challengeId',
      answerStatus: 'answers.result',
      answerValue: 'answers.value',
      answeredAt: 'answers.createdAt',
      competenceId: 'certification-challenges.competenceId',
      skillName: 'certification-challenges.associatedSkillName',
    })
    .from('assessments')
    .leftJoin('certification-challenges', 'certification-challenges.courseId', 'assessments.certificationCourseId')
    .leftJoin('answers', function () {
      this.on({ 'answers.assessmentId': 'assessments.id' }).andOn({
        'answers.challengeId': 'certification-challenges.challengeId',
      });
    })
    .where({
      'assessments.certificationCourseId': certificationCourseId,
    })
    .orderBy('certification-challenges.createdAt', 'asc');

  return _toDomain({ certificationChallengesDetailsDTO, liveAlertsDTO, certificationCourseDTO });
};

function _toDomain({ certificationChallengesDetailsDTO, liveAlertsDTO, certificationCourseDTO }) {
  const certificationChallengesForAdministration = certificationChallengesDetailsDTO.map(
    (certificationChallengeDetailsDTO) =>
      new V3CertificationChallengeForAdministration({
        ...certificationChallengeDetailsDTO,
        answerStatus: certificationChallengeDetailsDTO.answerStatus
          ? new AnswerStatus({ status: certificationChallengeDetailsDTO.answerStatus })
          : null,
        validatedLiveAlert: _certificationChallengeLiveAlertToDomain({
          liveAlertsDTO,
          certificationChallengeDetailsDTO,
        }),
      }),
  );

  return new V3CertificationCourseDetailsForAdministration({
    ...certificationCourseDTO,
    certificationChallengesForAdministration,
  });
}

export { getV3DetailsByCertificationCourseId };

function _certificationChallengeLiveAlertToDomain({ liveAlertsDTO, certificationChallengeDetailsDTO }) {
  const certificationChallengeLiveAlert = liveAlertsDTO.find(
    (liveAlertDTO) => liveAlertDTO.challengeId === certificationChallengeDetailsDTO.challengeId,
  );
  if (!certificationChallengeLiveAlert) {
    return null;
  }
  return new V3CertificationChallengeLiveAlertForAdministration({
    id: certificationChallengeLiveAlert.id,
    issueReportSubcategory: certificationChallengeLiveAlert.issueReportSubcategory,
  });
}
