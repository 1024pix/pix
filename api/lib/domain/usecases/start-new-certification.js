const { CertificationComputeError, UserNotAuthorizedToCertifyError } = require('../errors');
const CertificationChallenge = require('../models/CertificationChallenge');
const CertificationCourse = require('../models/CertificationCourse');
const Challenge = require('../models/Challenge');

module.exports = function startNewCertification({
  userId,
  sessionId,
  isoStringOfCertificationCreationDate,
  assessmentRepository,
  certificationCourseRepository,
  certificationChallengeRepository,
  challengeRepository,
}) {

  // 1 - get findLastCompletedAssessmentsForEachCoursesByUser
  // 2 - filter those with level > 0

  // 3 - get all correctly answered answer related skills
  // 4 - get all

  const contextObject = Object.seal({
    certifiableAssessments: undefined,
    certificationCourse: undefined,
  });

  return assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(
    userId,
    isoStringOfCertificationCreationDate,
  )
    .then(filterCertifiableAssessments)
    .then(validateThatUserHasAtLeast5CertifiableAssessments)
    .then(validateThatAllCertifiableAssessmentsHaveAtLeast3ValidAnswers)
    .then(saveCertifiableAssessmentsToContext(contextObject))
    .then(createCertificationCourse({ userId, sessionId, certificationCourseRepository }))
    .then(saveCertificationCourseToContext(contextObject))
    .then(selectChallengesToTest(contextObject))
    .then(mapSelectedChallengesToCertificationChallenges)
    .then(saveSelectedCertificationChallenges({ certificationChallengeRepository }))
    .then(returnCertificationCourseWithNumberOfChallenges(contextObject));
};

function filterCertifiableAssessments(assessments) {
  return assessments.filter((assessment) => assessment.getLevel() > 0);
}

function validateThatUserHasAtLeast5CertifiableAssessments(certifiableAssessments) {
  if (certifiableAssessments.length < 5) {
    return Promise.reject(new UserNotAuthorizedToCertifyError());
  } else {
    return certifiableAssessments;
  }
}

function validateThatAllCertifiableAssessmentsHaveAtLeast3ValidAnswers(certifiableAssessments) {
  const atLeastOneAssessmentHasLessThan3ValidAnswer = certifiableAssessments.some((assessment) => {
    // Extraire une propriété validAnswers dans assessment ? (Demeter tout ça)
    const numberOfValidAnswers = assessment.answers.filter((answer) => answer.isOk());
    return numberOfValidAnswers.length < 3;
  });

  if (atLeastOneAssessmentHasLessThan3ValidAnswer) {
    return Promise.reject(new CertificationComputeError());
  } else {
    return certifiableAssessments;
  }
}

function createCertificationCourse({ userId, sessionId, certificationCourseRepository }) {
  return () => {
    const certificationToSave = new CertificationCourse({ userId, sessionId });
    return certificationCourseRepository.save(certificationToSave);
  };
}

function saveCertifiableAssessmentsToContext(contextObject) {

  return (certifiableAssessments) => {
    contextObject.certifiableAssessments = certifiableAssessments;
    return certifiableAssessments;
  };
}

function saveCertificationCourseToContext(contextObject) {

  return (certificationCourse) => {
    contextObject.certificationCourse = certificationCourse;
    return certificationCourse;
  };
}

function selectChallengesToTest(contextObject) {

  // TODO utiliser un lodash fp.map ou fp.flatMap ?
  return () => {
    return contextObject.certifiableAssessments
      .reduce((selectedChallenges, certifiableAssessment) => {

        const challenge1 = new Challenge({
          // id,
          // status,
          // type,
          // answer,
          // skills = [],
          // competenceId,
        });
        const challenge2 = new Challenge({});
        const challenge3 = new Challenge({});
        return selectedChallenges.concat([
          challenge1,
          challenge2,
          challenge3,
        ]);
      }, []);
  };
}

function mapSelectedChallengesToCertificationChallenges(selectedChallenges) {
  // TODO utiliser un lodash fp.map ou fp.flatMap ?

  return selectedChallenges.map(() => {

    return new CertificationChallenge({
      // id,
      // associatedSkillName,
      // associatedSkillId,
      // challengeId,
      // courseId,
      // competenceId,
    });
  });
}

function saveSelectedCertificationChallenges({ certificationChallengeRepository }) {

  return (certificationChallenges) => {

    return certificationChallenges.map((certificationChallenge) => {

      return certificationChallengeRepository.save(certificationChallenge);
    });
  };
}

function returnCertificationCourseWithNumberOfChallenges(contextObject) {

  return () => {
    const certificationCourseWithNumberOfChallenges = new CertificationCourse(contextObject.certificationCourse);
    // TODO : change that...
    certificationCourseWithNumberOfChallenges.nbChallenges = 15;
    return certificationCourseWithNumberOfChallenges;
  };
}
