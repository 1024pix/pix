const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');
const {
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS,
  PIX_ORIGIN,
} = require('../constants');

const KnowledgeElement = require('../models/KnowledgeElement');
const UserCompetence = require('../models/UserCompetence');
const Challenge = require('../models/Challenge');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileWithLearningContentRepository = require('../../infrastructure/repositories/target-profile-with-learning-content-repository');
const certifiableProfileForLearningContentRepository = require('../../infrastructure/repositories/certifiable-profile-for-learning-content-repository');

module.exports = {

  async pickCertificationChallenges(placementProfile) {
    const knowledgeElementsByCompetence = await knowledgeElementRepository
      .findUniqByUserIdGroupedByCompetenceId({ userId: placementProfile.userId, limitDate: placementProfile.profileDate });
    const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);

    const answerIds = _.map(knowledgeElements, 'answerId');
    const alreadyAnsweredChallengeIds = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();

    const certifiableUserCompetencesWithOrderedSkills =
      UserCompetence.orderSkillsOfCompetenceByDifficulty(placementProfile.userCompetences)
        .filter((uc) => uc.isCertifiable());

    let certificationChallenges = [];
    for (const userCompetence of certifiableUserCompetencesWithOrderedSkills) {
      const certificationChallengesForCompetence = [];
      for (const skill of userCompetence.skills) {
        if (certificationChallengesForCompetence.length >= MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION) break;
        const alreadySelectedChallengeIds = [
          ..._.map(certificationChallenges, 'challengeId'),
          ..._.map(certificationChallengesForCompetence, 'challengeId'),
        ];
        const certificationChallenge = _pickCertificationChallengeForSkill(skill, userCompetence.id, allFrFrOperativeChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds);
        if (certificationChallenge) certificationChallengesForCompetence.push(certificationChallenge);
      }
      certificationChallenges = [...certificationChallenges, ...certificationChallengesForCompetence];
    }

    return certificationChallenges;
  },

  async pickCertificationChallengesForPixPlus(targetProfileId, userId) {
    const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({ id: targetProfileId });
    const certifiableProfile = await certifiableProfileForLearningContentRepository.get({ id: userId, profileDate: new Date(), targetProfileWithLearningContent });
    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();

    const excludedOrigins = [PIX_ORIGIN];
    const skillIdsByArea = certifiableProfile.getOrderedCertifiableSkillsByAreaId(excludedOrigins);
    const alreadyAnsweredChallengeIds = certifiableProfile.getAlreadyAnsweredChallengeIds();
    let certificationChallenges = [];

    for (const skillIds of Object.values(skillIdsByArea)) {
      const certificationChallengesForArea = [];
      for (const skillId of skillIds) {
        if (certificationChallengesForArea.length >= MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS) break;
        const alreadySelectedChallengeIds = [
          ..._.map(certificationChallenges, 'challengeId'),
          ..._.map(certificationChallengesForArea, 'challengeId'),
        ];
        const skill = targetProfileWithLearningContent.findSkill(skillId);
        const competenceId = targetProfileWithLearningContent.getCompetenceIdOfSkill(skillId);
        const certificationChallenge = _pickCertificationChallengeForSkill(skill, competenceId, allFrFrOperativeChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds);
        if (certificationChallenge) certificationChallengesForArea.push(certificationChallenge);
      }
      certificationChallenges = certificationChallenges.concat(certificationChallengesForArea);
    }

    return certificationChallenges;
  },
};

function _pickCertificationChallengeForSkill(skill, competenceId, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds) {
  const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
  const unansweredChallenges = _.filter(challengesToValidateCurrentSkill, (challenge) => !alreadyAnsweredChallengeIds.includes(challenge.id));

  const challengesPoolToPickChallengeFrom = _.isEmpty(unansweredChallenges) ? challengesToValidateCurrentSkill : unansweredChallenges;
  if (_.isEmpty(challengesPoolToPickChallengeFrom)) {
    return;
  }
  const challenge = _.sample(challengesPoolToPickChallengeFrom);

  if (alreadySelectedChallengeIds.includes(challenge.id)) return;

  return new CertificationChallenge({
    challengeId: challenge.id,
    competenceId,
    associatedSkillName: skill.name,
    associatedSkillId: skill.id,
  });
}
