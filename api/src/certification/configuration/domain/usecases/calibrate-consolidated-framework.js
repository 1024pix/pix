export const calibrateConsolidatedFramework = async ({
  createdAt,
  complementaryCertificationKey,
  certificationFrameworksChallengeRepository,
  activeCalibratedChallengeRepository,
}) => {
  const certificationFrameworksChallenges = await certificationFrameworksChallengeRepository.find({
    complementaryCertificationKey,
    createdAt,
  });

  const challengeIds = certificationFrameworksChallenges.map(({ challengeId }) => challengeId);

  const activeCalibratedChallenges = await activeCalibratedChallengeRepository.findByComplementaryKeyAndChallengeIds({
    complementaryCertificationKey,
    challengeIds,
  });

  const calibratedCertificationFrameworksChallenges = certificationFrameworksChallenges.map((certificationChallenge) =>
    certificationChallenge.calibrate({
      activeCalibratedChallenges,
    }),
  );

  return certificationFrameworksChallengeRepository.save({
    calibratedCertificationFrameworksChallenges,
  });
};
