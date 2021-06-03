const { checkEventTypes } = require('./check-event-types');
const SessionFinalized = require('./SessionFinalized');
const AutoJuryDone = require('./AutoJuryDone');
const CertificationJuryDone = require('./CertificationJuryDone');

const eventTypes = [ SessionFinalized ];

async function handleAutoJury({
  event,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId: event.sessionId });

  const certificationJuryDoneEvents = await Promise.all(certificationCourses.map(async(certificationCourse) =>
    _autoNeutralizeChallenges({
      certificationCourse,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
    })));

  const filteredCertificationJuryDoneEvents = certificationJuryDoneEvents.filter((certificationJuryDoneEvent) => Boolean(certificationJuryDoneEvent));

  return [new AutoJuryDone({
    sessionId: event.sessionId,
    finalizedAt: event.finalizedAt,
    certificationCenterName: event.certificationCenterName,
    sessionDate: event.sessionDate,
    sessionTime: event.sessionTime,
    hasExaminerGlobalComment: event.hasExaminerGlobalComment,
  }),
  ...filteredCertificationJuryDoneEvents,
  ];
}

async function _autoNeutralizeChallenges({
  certificationCourse,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
}) {
  const certificationIssueReports = await certificationIssueReportRepository.findByCertificationCourseId(certificationCourse.id);
  if (certificationIssueReports.length === 0) {
    return null;
  }
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: certificationCourse.id });

  const neutralizableIssueReports = certificationIssueReports.filter((issueReport) => issueReport.isAutoNeutralizable);

  let certificationImpacted = 0;
  for (const neutralizableIssueReport of neutralizableIssueReports) {
    const questionNumber = neutralizableIssueReport.questionNumber;
    const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkipped(questionNumber);
    if (neutralizationAttempt.hasSucceeded()) {
      neutralizableIssueReport.resolve('Cette question a été neutralisée automatiquement');
      await certificationIssueReportRepository.save(neutralizableIssueReport);
      certificationImpacted++;
    }
  }

  if (certificationImpacted > 0) {
    await certificationAssessmentRepository.save(certificationAssessment);
    return new CertificationJuryDone({ certificationCourseId: certificationCourse.id });
  }

  return null;
}

handleAutoJury.eventTypes = eventTypes;
module.exports = handleAutoJury;
