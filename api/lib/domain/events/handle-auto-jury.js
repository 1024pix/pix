const { checkEventTypes } = require('./check-event-types');
const SessionFinalized = require('./SessionFinalized');
const CertificationIssueReportResolutionAttempt = require('../models/CertificationIssueReportResolutionAttempt');
const AutoJuryDone = require('./AutoJuryDone');
const CertificationJuryDone = require('./CertificationJuryDone');
const bluebird = require('bluebird');
const { CertificationIssueReportResolutionStrategies } = require('../models/CertificationIssueReportResolutionStrategies');

const eventTypes = [ SessionFinalized ];

async function handleAutoJury({
  event,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  challengeRepository,
  logger,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId: event.sessionId });

  const resolutionStrategies = new CertificationIssueReportResolutionStrategies({
    certificationIssueReportRepository,
    challengeRepository,
  });

  const certificationJuryDoneEvents = await Promise.all(certificationCourses.map(async(certificationCourse) =>
    _autoNeutralizeChallenges({
      certificationCourse,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      resolutionStrategies,
      logger,
    })));

  const filteredCertificationJuryDoneEvents = certificationJuryDoneEvents.filter((certificationJuryDoneEvent) => Boolean(certificationJuryDoneEvent));

  return [
    ...filteredCertificationJuryDoneEvents,
    new AutoJuryDone({
      sessionId: event.sessionId,
      finalizedAt: event.finalizedAt,
      certificationCenterName: event.certificationCenterName,
      sessionDate: event.sessionDate,
      sessionTime: event.sessionTime,
      hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    }),
  ];
}

async function _autoNeutralizeChallenges({
  certificationCourse,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  resolutionStrategies,
  logger,
}) {
  const certificationIssueReports = await certificationIssueReportRepository.findByCertificationCourseId(certificationCourse.getId());
  if (certificationIssueReports.length === 0) {
    return null;
  }
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: certificationCourse.getId() });

  const resolutionAttempts = await bluebird.mapSeries(certificationIssueReports, async (certificationIssueReport) => {
    try {
      return await resolutionStrategies.resolve({ certificationIssueReport, certificationAssessment });
    } catch (e) {
      logger.error(e);
      return CertificationIssueReportResolutionAttempt.unresolved();
    }
  });

  if (resolutionAttempts.some((attempt) => attempt.isResolvedWithEffect())) {
    await certificationAssessmentRepository.save(certificationAssessment);
    return new CertificationJuryDone({ certificationCourseId: certificationCourse.getId() });
  }

  return null;
}

handleAutoJury.eventTypes = eventTypes;
module.exports = handleAutoJury;
