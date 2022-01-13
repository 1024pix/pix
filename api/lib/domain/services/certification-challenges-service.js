const _ = require('lodash');

const CertificationChallenge = require('../models/CertificationChallenge');

const {
  MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS,
  PIX_ORIGIN,
} = require('../constants');

const KnowledgeElement = require('../models/KnowledgeElement');
const Challenge = require('../models/Challenge');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileWithLearningContentRepository = require('../../infrastructure/repositories/target-profile-with-learning-content-repository');
const certifiableProfileForLearningContentRepository = require('../../infrastructure/repositories/certifiable-profile-for-learning-content-repository');
const flash = require('../services/algorithm-methods/flash');
const flashDataFetcher = require('../services/algorithm-methods/data-fetcher');

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

  async pickCertificationChallengesForPixPlus(certifiableBadge, userId, locale) {
    const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({
      id: certifiableBadge.targetProfileId,
    });
    const certifiableProfile = await certifiableProfileForLearningContentRepository.get({
      id: userId,
      profileDate: new Date(),
      targetProfileWithLearningContent,
    });

    const excludedOrigins = [PIX_ORIGIN];
    const skillIdsByArea = certifiableProfile.getOrderedCertifiableSkillsByAreaId(excludedOrigins);

    const alreadyAnsweredChallengeIds = certifiableProfile.getAlreadyAnsweredChallengeIds();

    const allOperativeChallengesForLocale = await challengeRepository.findOperativeHavingLocale(locale);
    return _pickCertificationChallengesForAllAreas(
      skillIdsByArea,
      alreadyAnsweredChallengeIds,
      allOperativeChallengesForLocale,
      targetProfileWithLearningContent,
      certifiableBadge.key
    );
  },

  async pickFirstCertificationChallengeForFlash(userId, locale, domainTransaction) {
    const flashData = await flashDataFetcher.fetchForFlashCertification({
      answerRepository,
      challengeRepository,
      locale,
      domainTransaction,
    });
    const algoResult = flash.getPossibleNextChallenges(flashData);
    // FIXME use another seed?
    const firstChallenge = flash.pickRandomChallenge(algoResult.possibleChallenges, userId);

    return CertificationChallenge.createForPixCertification({
      challengeId: firstChallenge.id,
      competenceId: firstChallenge.competenceId,
      associatedSkillId: firstChallenge.skills[0].id,
      associatedSkillName: firstChallenge.skills[0].name,
    });
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
      allChallenges,
      pickedCertificationChallenges
    );
    pickedCertificationChallenges = pickedCertificationChallenges.concat(certificationChallengesForCompetence);
  }
  return pickedCertificationChallenges;
}

function _getTubeName(certificationChallengeInResult) {
  return certificationChallengeInResult.associatedSkillName.slice(0, -1);
}

function _pick3CertificationChallengesForCompetence(
  userCompetence,
  alreadyAnsweredChallengeIds,
  allChallenges,
  certificationChallengesPickedForOtherCompetences
) {
  const result = [];
  const alreadySelectedChallengeIds = _.map(certificationChallengesPickedForOtherCompetences, 'challengeId');

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
        alreadySelectedChallengeIds,
      });

      if (challenge) {
        const certificationChallenge = CertificationChallenge.createForPixCertification({
          challengeId: challenge.id,
          competenceId: userCompetence.id,
          associatedSkillName: skill.name,
          associatedSkillId: skill.id,
        });

        alreadySelectedChallengeIds.push(certificationChallenge.challengeId);
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
  targetProfileWithLearningContent,
  certifiableBadgeKey
) {
  let pickedCertificationChallenges = [];
  for (const skillIds of Object.values(skillIdsByArea)) {
    const certificationChallengesForArea = _pick4CertificationChallengesForArea(
      skillIds,
      alreadyAnsweredChallengeIds,
      allChallenges,
      targetProfileWithLearningContent,
      certifiableBadgeKey,
      pickedCertificationChallenges
    );
    pickedCertificationChallenges = pickedCertificationChallenges.concat(certificationChallengesForArea);
  }

  return pickedCertificationChallenges;
}

function _pick4CertificationChallengesForArea(
  skillIds,
  alreadyAnsweredChallengeIds,
  allChallenges,
  targetProfileWithLearningContent,
  certifiableBadgeKey,
  certificationChallengesPickedForOtherCompetences
) {
  const result = [];
  const alreadySelectedChallengeIds = _.map(certificationChallengesPickedForOtherCompetences, 'challengeId');

  for (const skillId of skillIds) {
    if (_haveEnoughCertificationChallenges(result, MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS)) {
      break;
    }

    const skill = targetProfileWithLearningContent.findSkill(skillId);
    const competenceId = targetProfileWithLearningContent.getCompetenceIdOfSkill(skillId);

    const challenge = _pickChallengeForSkill({
      skill,
      allChallenges,
      alreadyAnsweredChallengeIds,
      alreadySelectedChallengeIds,
    });
    if (challenge) {
      const certificationChallenge = CertificationChallenge.createForPixPlusCertification({
        challengeId: challenge.id,
        competenceId,
        associatedSkillName: skill.name,
        associatedSkillId: skill.id,
        certifiableBadgeKey,
      });

      alreadySelectedChallengeIds.push(certificationChallenge.challengeId);
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

function _pickChallengeForSkill({ skill, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds }) {
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

  if (alreadySelectedChallengeIds.includes(challenge.id)) return;
  return challenge;
}
