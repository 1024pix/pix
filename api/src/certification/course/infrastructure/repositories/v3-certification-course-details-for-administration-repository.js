import { knex } from '../../../../../db/knex-database-connection.js';
import { V3CertificationChallengeForAdministration } from '../../domain/models/V3CertificationChallengeForAdministration.js';
import { V3CertificationCourseDetailsForAdministration } from '../../domain/models/V3CertificationCourseDetailsForAdministration.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { V3CertificationChallengeLiveAlertForAdministration } from '../../domain/models/V3CertificationChallengeLiveAlertForAdministration.js';
import { CertificationChallengeLiveAlertStatus } from '../../../session/domain/models/CertificationChallengeLiveAlert.js';

const getV3DetailsByCertificationCourseId = async function ({ certificationCourseId }) {
  const liveAlerts = await knex
    .with('validated-live-alerts', (queryBuilder) => {
      queryBuilder
        .select('*')
        .from('certification-challenge-live-alerts')
        .where({ status: CertificationChallengeLiveAlertStatus.VALIDATED });
    })
    .select({
      id: 'validated-live-alerts.id',
      challengeId: 'validated-live-alerts.challengeId',
    })
    .from('assessments')
    .leftJoin('validated-live-alerts', 'validated-live-alerts.assessmentId', 'assessments.id')
    .where({ 'assessments.certificationCourseId': certificationCourseId })
    .orderBy('validated-live-alerts.createdAt', 'ASC');

  const certificationIssueReports = await knex('certification-issue-reports')
    .select('subcategory')
    .where({ certificationCourseId })
    .orderBy('certification-issue-reports.createdAt', 'ASC');

  const liveAlertsDTO = certificationIssueReports.map((certificationIssueReport, index) => ({
    id: liveAlerts[index].id,
    issueReportSubcategory: certificationIssueReport.subcategory,
    challengeId: liveAlerts[index].challengeId,
  }));

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

  return _toDomain({ certificationChallengesDetailsDTO, certificationCourseId, liveAlertsDTO });
};

function _toDomain({ certificationChallengesDetailsDTO, certificationCourseId, liveAlertsDTO }) {
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
    certificationCourseId,
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
