import { UserEligibilityCalculator } from '../models/UserEligibilityCalculator.js';

async function getUserEligibilityList({
  userId,
  limitDate = new Date(),
  knowledgeElementRepository,
  competenceRepository,
  userEligibilityCalculatorRepository,
  complementaryCertificationCourseRepository,
  certificationBadgesService,
}) {
  const userEligibilityCalculator = new UserEligibilityCalculator({ userId, date: limitDate });
  await _computeCoreEligibility({
    userId,
    limitDate,
    userEligibilityCalculator,
    knowledgeElementRepository,
    competenceRepository,
  });
  await _computeComplementaryEligibilities({
    userId,
    limitDate,
    userEligibilityCalculator,
    userEligibilityCalculatorRepository,
    complementaryCertificationCourseRepository,
    certificationBadgesService,
  });
  return userEligibilityCalculator.buildUserEligibilityList();
}

async function _computeCoreEligibility({
  userId,
  limitDate,
  userEligibilityCalculator,
  knowledgeElementRepository,
  competenceRepository,
}) {
  const allKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: userId,
    limitDate,
  });
  const coreCompetences = await competenceRepository.listPixCompetencesOnly();
  userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });
}

async function _computeComplementaryEligibilities({
  userId,
  limitDate,
  userEligibilityCalculator,
  userEligibilityCalculatorRepository,
  complementaryCertificationCourseRepository,
  certificationBadgesService,
}) {
  const highestLatestCertifiableBadgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });
  let complementaryCertificationCourseWithResults;
  let howManyVersionsBehindByComplementaryCertificationBadgeId;
  if (highestLatestCertifiableBadgeAcquisitions.length > 0) {
    complementaryCertificationCourseWithResults = await complementaryCertificationCourseRepository.findByUserId({
      userId,
    });
    howManyVersionsBehindByComplementaryCertificationBadgeId =
      await userEligibilityCalculatorRepository.findHowManyVersionsBehindByComplementaryCertificationBadgeId();
  }

  userEligibilityCalculator.computeComplementaryEligibilities({
    certifiableBadgeAcquisitions: highestLatestCertifiableBadgeAcquisitions,
    complementaryCertificationCourseWithResults,
    howManyVersionsBehindByComplementaryCertificationBadgeId,
  });
}

export { getUserEligibilityList };
