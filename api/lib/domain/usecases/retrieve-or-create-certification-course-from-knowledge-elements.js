const CertificationCourse = require('../models/CertificationCourse');

module.exports = async function retrieveOrCreateCertificationCourseFromKnowledgeElements({ userId, sessionId, certificationChallengesService, certificationCourseRepository, challengeRepository }) {

  const certificationCourse = await certificationCourseRepository.save(new CertificationCourse({ userId, sessionId }));

  const allChallenges = await challengeRepository.list();

  const userKnowledgeElementsWithChallengeId = await certificationChallengesService.getUserKnowledgeElementsWithChallengeId();
  const knowledgeElementsWithChallengeIdsByCompetences = certificationChallengesService.groupUserKnowledgeElementsByCompetence(userKnowledgeElementsWithChallengeId);
  const selectedKnowledgeElementsWithChallengeId = certificationChallengesService.selectThreeKnowledgeElementsHigherSkillsByCompetence(knowledgeElementsWithChallengeIdsByCompetences);
  const userCertificationChallenges = certificationChallengesService.findChallengesByCompetenceId(allChallenges, selectedKnowledgeElementsWithChallengeId);

  const certificationCourseWithChallenges = await certificationChallengesService.saveChallenges(userCertificationChallenges, certificationCourse);

  return {
    created: true,
    certificationCourse: certificationCourseWithChallenges
  };
};
