import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { CertificationChallengeLiveAlertStatus } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';
import { V3CertificationChallengeForAdministration } from '../../domain/models/V3CertificationChallengeForAdministration.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../domain/models/V3CertificationChallengeLiveAlertForAdministration.js';
import { V3CertificationCourseDetailsForAdministration } from '../../domain/models/V3CertificationCourseDetailsForAdministration.js';

const getV3DetailsByCertificationCourseId = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const liveAlertsDTO = await knexConn('certification-challenge-live-alerts')
    .select({
      id: 'certification-challenge-live-alerts.id',
      challengeId: 'certification-challenge-live-alerts.challengeId',
      issueReportSubcategory: 'certification-issue-reports.subcategory',
    })
    .join('assessments', function () {
      this.on('assessments.id', 'certification-challenge-live-alerts.assessmentId').andOnVal(
        'assessments.certificationCourseId',
        certificationCourseId,
      );
    })
    .leftJoin(
      'certification-issue-reports',
      'certification-issue-reports.liveAlertId',
      'certification-challenge-live-alerts.id',
    )
    .where('certification-challenge-live-alerts.status', CertificationChallengeLiveAlertStatus.VALIDATED)
    .orderBy('certification-challenge-live-alerts.createdAt', 'ASC');

  const certificationCourseDTO = await knexConn
    .select({
      isRejectedForFraud: 'certification-courses.isRejectedForFraud',
      certificationCourseId: 'certification-courses.id',
      createdAt: 'certification-courses.createdAt',
      completedAt: 'certification-courses.completedAt',
      abortReason: 'certification-courses.abortReason',
      assessmentState: 'assessments.state',
      assessmentResultStatus: 'assessment-results.status',
      pixScore: 'assessment-results.pixScore',
      endedAt: 'certification-courses.endedAt',
    })
    .from('certification-courses')
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where({
      'certification-courses.id': certificationCourseId,
    })
    .first();

  const certificationChallengesDetailsDTO = await knexConn
    .select({
      challengeId: 'certification-challenges.challengeId',
      answerStatus: 'answers.result',
      answerValue: 'answers.value',
      answeredAt: 'answers.createdAt',
      competenceId: 'certification-challenges.competenceId',
      skillName: 'certification-challenges.associatedSkillName',
    })
    .from('assessments')
    .innerJoin('certification-challenges', 'certification-challenges.courseId', 'assessments.certificationCourseId')
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
    numberOfChallenges: null,
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
