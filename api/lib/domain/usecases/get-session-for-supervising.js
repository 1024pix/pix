import bluebird from 'bluebird';

const getSessionForSupervising = async function ({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get(sessionId);

  await bluebird.mapSeries(sessionForSupervising.certificationCandidates, async (certificationCandidate) => {
    if (certificationCandidate.enrolledComplementaryCertification) {
      certificationCandidate.stillValidBadgeAcquisitions =
        await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId: certificationCandidate.userId,
        });
    }
  });

  return sessionForSupervising;
};

export { getSessionForSupervising };
