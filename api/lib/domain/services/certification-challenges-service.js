const _ = require('lodash');

const CertificationChallenge = require('../models/CertificationChallenge.js');

const {
  MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS,
  PIX_ORIGIN,
} = require('../constants.js');

const KnowledgeElement = require('../models/KnowledgeElement.js');
const Challenge = require('../models/Challenge.js');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository.js');
const answerRepository = require('../../infrastructure/repositories/answer-repository.js');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const learningContentRepository = require('../../infrastructure/repositories/learning-content-repository.js');
const certifiableProfileForLearningContentRepository = require('../../infrastructure/repositories/certifiable-profile-for-learning-content-repository.js');

module.exports = {
  async pickCertificationChallenges(placementProfile, locale) {
    const certifiableUserCompetences = placementProfile.getCertifiableUserCompetences();

    const alreadyAnsweredChallengeIds = await _getAlreadyAnsweredChallengeIds(
      knowledgeElementRepository,
      answerRepository,
      placementProfile.userId,
      placementProfile.profileDate
    );

    const allOperativeChallengesForLocale = await challengeRepository.findOperativeHavingLocale(locale);

    return _pickCertificationChallengesForCertifiableCompetences(
      certifiableUserCompetences,
      alreadyAnsweredChallengeIds,
      allOperativeChallengesForLocale
    );
  },

  async pickCertificationChallengesForPixPlus(campaignId, badgeKey, userId, locale) {
    const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
    const certifiableProfile = await certifiableProfileForLearningContentRepository.get({
      id: userId,
      profileDate: new Date(),
      learningContent,
    });

    const excludedOrigins = [PIX_ORIGIN];
    const skillIdsByDecreasingDifficultyGroupedByArea =
      certifiableProfile.getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId(excludedOrigins);

    const alreadyAnsweredChallengeIds = certifiableProfile.getAlreadyAnsweredChallengeIds();

    const allOperativeChallengesForLocale = await challengeRepository.findOperativeHavingLocale(locale);
    return _pickCertificationChallengesForAllAreas(
      skillIdsByDecreasingDifficultyGroupedByArea,
      alreadyAnsweredChallengeIds,
      allOperativeChallengesForLocale,
      learningContent,
      badgeKey
    );
  },
};

async function _getAlreadyAnsweredChallengeIds(knowledgeElementRepository, answerRepository, userId, limitDate) {
  const knowledgeElementsByCompetence = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
    userId,
    limitDate,
  });
  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  return answerRepository.findChallengeIdsFromAnswerIds(answerIds);
}

function _pickCertificationChallengesForCertifiableCompetences(
  certifiableUserCompetences,
  alreadyAnsweredChallengeIds,
  allChallenges
) {
  let pickedCertificationChallenges = [];
  for (const userCompetence of certifiableUserCompetences) {
    const certificationChallengesForCompetence = _pick3CertificationChallengesForCompetence(
      userCompetence,
      alreadyAnsweredChallengeIds,
      allChallenges
    );
    pickedCertificationChallenges = pickedCertificationChallenges.concat(certificationChallengesForCompetence);
  }
  return pickedCertificationChallenges;
}

function _getTubeName(certificationChallengeInResult) {
  return certificationChallengeInResult.associatedSkillName.slice(0, -1);
}

function _pick3CertificationChallengesForCompetence(userCompetence, alreadyAnsweredChallengeIds, allChallenges) {
  const result = [];

  const groupedByDifficultySkills = _(userCompetence.getSkillsAtLatestVersion())
    .orderBy('difficulty', 'desc')
    .groupBy('difficulty')
    .value();

  const groupedByDescDifficultySkills = _.reverse(Object.keys(groupedByDifficultySkills).sort());
  for (const difficulty of groupedByDescDifficultySkills) {
    const skills = groupedByDifficultySkills[difficulty];
    const certificationChallengesForDifficulty = [];
    for (const skill of skills) {
      const challenge = _pickChallengeForSkill({
        skill,
        allChallenges,
        alreadyAnsweredChallengeIds,
      });

      if (challenge) {
        const certificationChallenge = CertificationChallenge.createForPixCertification({
          challengeId: challenge.id,
          competenceId: userCompetence.id,
          associatedSkillName: skill.name,
          associatedSkillId: skill.id,
        });
        certificationChallengesForDifficulty.push(certificationChallenge);
      }
    }

    const [certificationChallengesWithTubeAlreadyAdded, certificationChallengesWithTubeNotAlreadyAdded] = _.partition(
      certificationChallengesForDifficulty,
      (certificationChallenge) =>
        result.some(
          (certificationChallengeInResult) =>
            _getTubeName(certificationChallenge) === _getTubeName(certificationChallengeInResult)
        )
    );

    result.push(...certificationChallengesWithTubeNotAlreadyAdded, ...certificationChallengesWithTubeAlreadyAdded);

    if (_haveEnoughCertificationChallenges(result, MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION)) {
      break;
    }
  }
  return _keepOnly3Challenges(result);
}

function _pickCertificationChallengesForAllAreas(
  skillIdsByArea,
  alreadyAnsweredChallengeIds,
  allChallenges,
  learningContent,
  certifiableBadgeKey
) {
  let pickedCertificationChallenges = [];
  for (const skillIds of Object.values(skillIdsByArea)) {
    const certificationChallengesForArea = _pick4CertificationChallengesForArea(
      skillIds,
      alreadyAnsweredChallengeIds,
      allChallenges,
      learningContent,
      certifiableBadgeKey
    );
    pickedCertificationChallenges = pickedCertificationChallenges.concat(certificationChallengesForArea);
  }

  return pickedCertificationChallenges;
}

function _pick4CertificationChallengesForArea(
  skillIds,
  alreadyAnsweredChallengeIds,
  allChallenges,
  learningContent,
  certifiableBadgeKey
) {
  const result = [];

  for (const skillId of skillIds) {
    if (_haveEnoughCertificationChallenges(result, MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS)) {
      break;
    }

    const skill = learningContent.findSkill(skillId);
    const competenceId = learningContent.findCompetenceIdOfSkill(skillId);

    const challenge = _pickChallengeForSkill({
      skill,
      allChallenges,
      alreadyAnsweredChallengeIds,
    });
    if (challenge) {
      const certificationChallenge = CertificationChallenge.createForPixPlusCertification({
        challengeId: challenge.id,
        competenceId,
        associatedSkillName: skill.name,
        associatedSkillId: skill.id,
        certifiableBadgeKey,
      });

      result.push(certificationChallenge);
    }
  }

  return result;
}

function _haveEnoughCertificationChallenges(certificationChallenges, limitCount) {
  return certificationChallenges.length >= limitCount;
}

function _keepOnly3Challenges(result) {
  return result.slice(0, MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION);
}

function _pickChallengeForSkill({ skill, allChallenges, alreadyAnsweredChallengeIds }) {
  const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
  const unansweredChallenges = _.filter(
    challengesToValidateCurrentSkill,
    (challenge) => !alreadyAnsweredChallengeIds.includes(challenge.id)
  );

  const challengesPoolToPickChallengeFrom = _.isEmpty(unansweredChallenges)
    ? challengesToValidateCurrentSkill
    : unansweredChallenges;
  if (_.isEmpty(challengesPoolToPickChallengeFrom)) {
    return;
  }
  const challenge = _.sample(challengesPoolToPickChallengeFrom);

  return challenge;
}
