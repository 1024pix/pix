const _ = require('lodash');
const fp = require('lodash/fp');
const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');
const smartPlacementKnowledgeElementRepository = require('../../infrastructure/repositories/smart-placement-knowledge-element-repository');
const NUMBER_OF_CERTIFICATION_CHALLANGES_BY_COMPETENCES = 3;

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

  async getUserKnowledgeElementsWithChallengeId(userId, certificationStartDateTime) {
    return await smartPlacementKnowledgeElementRepository.findUniqByUserIdWithChallengeId(userId, certificationStartDateTime);
  },

  groupUserKnowledgeElementsByCompetence(knowledgeElementsWithChallengeIds) {
    return _.groupBy(knowledgeElementsWithChallengeIds, 'competenceId');
  },

  selectThreeKnowledgeElementsHigherSkillsByCompetence(knowledgeElementsWithChallengeIdsByCompetences) {
    return _.mapValues(knowledgeElementsWithChallengeIdsByCompetences, fp.take(NUMBER_OF_CERTIFICATION_CHALLANGES_BY_COMPETENCES));
  },

  findChallengesBySkills() {

  },
};
