const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');
const smartPlacementKnowledgeElementRepository = require('../../infrastructure/repositories/smart-placement-knowledge-element-repository');

module.exports = {

  saveChallenges(certificationProfile, certificationCourse) {
    const saveChallengePromises = [];
    certificationProfile.forEach((userCompetence) => {
      userCompetence.challenges.forEach((challenge) => {
        saveChallengePromises.push(certificationChallengeRepository.save(challenge, certificationCourse));
      });
    });

    return Promise.all(saveChallengePromises)
      .then((certificationChallenges) => {
        certificationCourse.nbChallenges = certificationChallenges.length;
        return certificationCourse;
      });
  },

  async getUserKnowledgeElementsWithAnswersAndSkills(userId, certificationStartDateTime) {
    return await smartPlacementKnowledgeElementRepository.findUniqByUserIdWithChallengeId();
  }
};
