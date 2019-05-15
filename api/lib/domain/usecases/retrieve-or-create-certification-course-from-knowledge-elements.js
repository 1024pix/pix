const CertificationCourse = require('../models/CertificationCourse');

module.exports = async function retrieveOrCreateCertificationCourseFromKnowledgeElements({ userId, sessionId, certificationChallengesService, certificationCourseRepository, challengeRepository }) {

  const allChallenges = await challengeRepository.list();

  const userKnowledgeElementsWithChallengeId = await certificationChallengesService.getUserKnowledgeElementsWithChallengeId();
  const knowledgeElementsWithChallengeIdsByCompetences = certificationChallengesService.groupUserKnowledgeElementsByCompetence(userKnowledgeElementsWithChallengeId);
  const selectedKnowledgeElementsWithChallengeId = certificationChallengesService.selectThreeKnowledgeElementsHigherSkillsByCompetence(knowledgeElementsWithChallengeIdsByCompetences);
  const userCertificationChallenges = certificationChallengesService.findChallengesByCompetenceId(allChallenges, selectedKnowledgeElementsWithChallengeId);
  const userCompetences = certificationChallengesService.convertChallengesToUserCompetences(userCertificationChallenges);

  const certificationCourse = await certificationCourseRepository.save(new CertificationCourse({ userId, sessionId }));
  const certificationCourseWithChallenges = await certificationChallengesService.saveChallenges(userCompetences, certificationCourse);

  return {
    created: true,
    certificationCourse: certificationCourseWithChallenges
  };
};
