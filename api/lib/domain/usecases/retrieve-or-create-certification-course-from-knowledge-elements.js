const CertificationCourse = require('../models/CertificationCourse');

module.exports = async function retrieveOrCreateCertificationCourseFromKnowledgeElements({ userId, sessionId, userService, certificationChallengesService, certificationCourseRepository }) {

  const certificationCourse = await certificationCourseRepository.save(new CertificationCourse({ userId, sessionId }));
  //const userCertificationChallenges = await userService.getUserCertificationChallenges(userId, 'Toto');
  return {
    created: true,
    certificationCourse: await certificationChallengesService.saveChallenges(certificationCourse, userCertificationChallenges)
  };
};
