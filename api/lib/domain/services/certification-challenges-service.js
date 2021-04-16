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
    const certifiableUserCompetencesWithOrderedSkills =
      UserCompetence.orderSkillsOfCompetenceByDifficulty(placementProfile.userCompetences)
        .filter((uc) => uc.isCertifiable());

    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();
    const alreadyAnsweredChallengeIds = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);
    return _pickCertificationChallengesForAllCompetences(certifiableUserCompetencesWithOrderedSkills, alreadyAnsweredChallengeIds, allFrFrOperativeChallenges);
  },

  async pickCertificationChallengesForPixPlus(certifiableBadge, userId) {
    const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({ id: certifiableBadge.targetProfileId });
    const certifiableProfile = await certifiableProfileForLearningContentRepository.get({ id: userId, profileDate: new Date(), targetProfileWithLearningContent });
    const excludedOrigins = [PIX_ORIGIN];
    const skillIdsByArea = certifiableProfile.getOrderedCertifiableSkillsByAreaId(excludedOrigins);

    const alreadyAnsweredChallengeIds = certifiableProfile.getAlreadyAnsweredChallengeIds();
    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();
    return _pickCertificationChallengesForAllAreas(skillIdsByArea, alreadyAnsweredChallengeIds, allFrFrOperativeChallenges, targetProfileWithLearningContent, certifiableBadge.key);
  },
};

function _pickCertificationChallengesForAllCompetences(competences, alreadyAnsweredChallengeIds, allChallenges) {
  let certificationChallenges = [];
  for (const competence of competences) {
    const certificationChallengesForCompetence = _pick3CertificationChallengesForCompetence(competence, alreadyAnsweredChallengeIds, allChallenges, certificationChallenges);
    certificationChallenges = certificationChallenges.concat(certificationChallengesForCompetence);
  }
  return certificationChallenges;
}

function _pick3CertificationChallengesForCompetence(competence, alreadyAnsweredChallengeIds, allChallenges, certificationChallengesPickedForOtherCompetences) {
  const certificationChallengesForCurrentCompetence = [];
  for (const skill of competence.skills) {
    if (_haveEnoughCertificationChallenges(certificationChallengesForCurrentCompetence, MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION)) break;
    const alreadySelectedChallengeIds = [
      ..._.map(certificationChallengesPickedForOtherCompetences, 'challengeId'),
      ..._.map(certificationChallengesForCurrentCompetence, 'challengeId'),
    ];

    const challenge = _pickChallengeForSkill({ skill, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds });
    if (challenge) {
      const certificationChallenge = CertificationChallenge.createForPixCertification({
        challengeId: challenge.id,
        competenceId: competence.id,
        associatedSkillName: skill.name,
        associatedSkillId: skill.id,
      });
      certificationChallengesForCurrentCompetence.push(certificationChallenge);
    }
  }

  return certificationChallengesForCurrentCompetence;
}

function _pickCertificationChallengesForAllAreas(skillIdsByArea, alreadyAnsweredChallengeIds, allChallenges, targetProfileWithLearningContent, certifiableBadgeKey) {
  let certificationChallenges = [];
  for (const skillIds of Object.values(skillIdsByArea)) {
    const certificationChallengesForArea = _pick4CertificationChallengesForArea(skillIds, alreadyAnsweredChallengeIds, allChallenges, targetProfileWithLearningContent, certifiableBadgeKey, certificationChallenges);
    certificationChallenges = certificationChallenges.concat(certificationChallengesForArea);
  }

  return certificationChallenges;
}

function _pick4CertificationChallengesForArea(skillIds, alreadyAnsweredChallengeIds, allChallenges, targetProfileWithLearningContent, certifiableBadgeKey, certificationChallengesPickedForOtherCompetences) {
  const certificationChallengesForCurrentArea = [];
  for (const skillId of skillIds) {
    if (_haveEnoughCertificationChallenges(certificationChallengesForCurrentArea, MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS)) break;
    const skill = targetProfileWithLearningContent.findSkill(skillId);
    const competenceId = targetProfileWithLearningContent.getCompetenceIdOfSkill(skillId);
    const alreadySelectedChallengeIds = [
      ..._.map(certificationChallengesPickedForOtherCompetences, 'challengeId'),
      ..._.map(certificationChallengesForCurrentArea, 'challengeId'),
    ];

    const challenge = _pickChallengeForSkill({ skill, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds });
    if (challenge) {
      const certificationChallenge = CertificationChallenge.createForPixPlusCertification({
        challengeId: challenge.id,
        competenceId,
        associatedSkillName: skill.name,
        associatedSkillId: skill.id,
        certifiableBadgeKey,
      });
      certificationChallengesForCurrentArea.push(certificationChallenge);
    }
  }

  return certificationChallengesForCurrentArea;
}

function _haveEnoughCertificationChallenges(certificationChallenges, limitCount) {
  return certificationChallenges.length >= limitCount;
}

function _pickChallengeForSkill({ skill, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds }) {
  const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
  const unansweredChallenges = _.filter(challengesToValidateCurrentSkill, (challenge) => !alreadyAnsweredChallengeIds.includes(challenge.id));

  const challengesPoolToPickChallengeFrom = _.isEmpty(unansweredChallenges) ? challengesToValidateCurrentSkill : unansweredChallenges;
  if (_.isEmpty(challengesPoolToPickChallengeFrom)) {
    return;
  }
  const challenge = _.sample(challengesPoolToPickChallengeFrom);

  if (alreadySelectedChallengeIds.includes(challenge.id)) return;
  return challenge;
}
