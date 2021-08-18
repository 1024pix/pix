const ChallengeNeutralized = require('./ChallengeNeutralized');
const ChallengeDeneutralized = require('./ChallengeDeneutralized');
const CertificationJuryDone = require('./CertificationJuryDone');
const { checkEventTypes } = require('./check-event-types');
const CertificationAutoCancelCheckDone = require('./CertificationAutoCancelCheckDone');

const eventTypes = [ChallengeNeutralized, ChallengeDeneutralized, CertificationJuryDone];

async function handleCertificationAutoCancelCheck({
  event,
  certificationAssessmentRepository,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId: event.certificationCourseId });
  const certificationCourse = await certificationCourseRepository.get(certificationAssessment.certificationCourseId);

  let commentForJury;
  if (certificationAssessment.hasMoreThan33PercentNeutralizedChallenges()) {
    certificationCourse.cancel();
    commentForJury = 'Certification annulée car plus de 33% des épreuves ont été neutralisées.';
  } else {
    certificationCourse.uncancel();
    commentForJury = '';
  }
  await certificationCourseRepository.update(certificationCourse);

  return new CertificationAutoCancelCheckDone({
    certificationCourseId: event.certificationCourseId,
    juryId: event.juryId,
    commentForJury,
  });
}

handleCertificationAutoCancelCheck.eventTypes = eventTypes;
module.exports = handleCertificationAutoCancelCheck;
