const CertificationCourse = require('../models/CertificationCourse');

module.exports = async function retrieveOrCreateCertificationCourseFromKnowledgeElements({ userId, sessionId, certificationChallengesService, certificationCourseRepository, challengeRepository }) {

  const certificationStartDateTime = new Date();

  const allChallenges = await challengeRepository.list();

  const userKnowledgeElementsWithChallengeId = await certificationChallengesService.getUserKnowledgeElementsWithChallengeId(userId, certificationStartDateTime);

  // TODO: [PF-577] Ajouter l'étape de tri des KE par niveau par compétence (les plus hauts en premier).
  // sortUserKnowledgeElementsHighterSkillsFirstByCompetence ?

  const knowledgeElementsWithChallengeIdsByCompetences = certificationChallengesService.groupUserKnowledgeElementsByCompetence(userKnowledgeElementsWithChallengeId);

  // TODO: [PF-577] Ajouter une étape pour récupérer les variantes des questions.

  // TODO: [PF-577] Supprimer les challenges auxquels le user a déjà répondu (du boulot)

  const selectedKnowledgeElementsWithChallengeId = certificationChallengesService.selectThreeKnowledgeElementsHigherSkillsByCompetence(knowledgeElementsWithChallengeIdsByCompetences);

  const userCertificationChallenges = certificationChallengesService.findChallengesByCompetenceId(allChallenges, selectedKnowledgeElementsWithChallengeId);

  // TODO: [PF-577] Ajouter les testedSkills (source de donnée: skill.name) aux challenges.

  const userCompetences = certificationChallengesService.convertChallengesToUserCompetences(userCertificationChallenges);

  const certificationCourse = await certificationCourseRepository.save(new CertificationCourse({ userId, sessionId }));
  const certificationCourseWithChallenges = await certificationChallengesService.saveChallenges(userCompetences, certificationCourse);

  return {
    created: true,
    certificationCourse: certificationCourseWithChallenges
  };
};
