/*
TODO / reflexions :
Valider qu'une certif complémentaire ne génère pas d'assessment result
 */
/**
 * @typedef {import('./index.js').UserCertificabilityCalculatorRepository} UserCertificabilityRepository
 * @typedef {import('./index.js').KnowledgeElementRepository} KnowledgeElementRepository
 * @typedef {import('./index.js').CompetenceRepository} CompetenceRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 */
/**
 * @param {Object} params
 * @param {UserCertificabilityCalculatorRepository} params.userCertificabilityCalculatorRepository
 * @param {KnowledgeElementRepository} params.knowledgeElementRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 */
export async function getUserCertificability({
  userId,
  userCertificabilityCalculatorRepository,
  knowledgeElementRepository,
  competenceRepository,
  certificationBadgesService,
}) {
  const now = new Date();
  const userCertificabilityCalculator = await userCertificabilityCalculatorRepository.getByUserId({ userId });
  const {
    latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt,
  } = await userCertificabilityCalculatorRepository.getActivityDatesForUserId({ userId });
  if (
    userCertificabilityCalculator.isUpToDate({
      realLatestKnowledgeElementCreatedAt: latestKnowledgeElementCreatedAt,
      realLatestCertificationDeliveredAt: latestCertificationDeliveredAt,
      realLatestBadgeAcquisitionUpdatedAt: latestBadgeAcquisitionUpdatedAt,
      realLatestComplementaryCertificationBadgeDetachedAt: latestComplementaryCertificationBadgeDetachedAt,
    })
  ) {
    return userCertificabilityCalculator.buildUserCertificability();
  }

  userCertificabilityCalculator.reset({
    newLatestKnowledgeElementCreatedAt: latestKnowledgeElementCreatedAt,
    newLatestCertificationDeliveredAt: latestCertificationDeliveredAt,
    newLatestBadgeAcquisitionUpdatedAt: latestBadgeAcquisitionUpdatedAt,
    newLatestComplementaryCertificationBadgeDetachedAt: latestComplementaryCertificationBadgeDetachedAt,
  });
  await computeCoreCertificability({
    userCertificabilityCalculator,
    now,
    knowledgeElementRepository,
    competenceRepository,
  });
  await computeComplementaryCertificabilities({
    userCertificabilityCalculator,
    now,
    certificationBadgesService,
    userCertificabilityCalculatorRepository,
  });

  await userCertificabilityCalculatorRepository.save(userCertificabilityCalculator);
  return userCertificabilityCalculator.buildUserCertificability();
}

async function computeCoreCertificability({
  userCertificabilityCalculator,
  now,
  knowledgeElementRepository,
  competenceRepository,
}) {
  const allKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: userCertificabilityCalculator.userId,
    limitDate: now,
  });
  const coreCompetences = await competenceRepository.listPixCompetencesOnly();
  userCertificabilityCalculator.computeCoreCertificability({ allKnowledgeElements, coreCompetences });
}

async function computeComplementaryCertificabilities({
  userCertificabilityCalculator,
  now,
  certificationBadgesService,
  userCertificabilityCalculatorRepository,
}) {
  const highestLatestCertifiableBadgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId: userCertificabilityCalculator.userId,
    limitDate: now,
  });
  let minimumEarnedPixValuesByComplementaryCertificationBadgeId;
  let highestPixScoreObtainedInCoreCertification;
  if (highestLatestCertifiableBadgeAcquisitions.length > 0) {
    minimumEarnedPixValuesByComplementaryCertificationBadgeId =
      await userCertificabilityCalculatorRepository.findMinimumEarnedPixValuesByComplementaryCertificationBadgeId();
    highestPixScoreObtainedInCoreCertification =
      await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({
        userId: userCertificabilityCalculator.userId,
      });
  }
  userCertificabilityCalculator.computeComplementaryCertificabilities({
    certifiableBadgeAcquisitions: highestLatestCertifiableBadgeAcquisitions,
    minimumEarnedPixValuesByComplementaryCertificationBadgeId,
    highestPixScoreObtainedInCoreCertification,
  });
}
