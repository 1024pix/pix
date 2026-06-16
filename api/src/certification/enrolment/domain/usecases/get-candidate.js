/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 */

/**
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 */
export async function getCandidate({
  certificationCandidateId,
  candidateRepository,
  certificationBadgesService,
  certificationCenterRepository,
}) {
  const candidate = await candidateRepository.get({ certificationCandidateId });

  if (!candidate.isRegisteredToDoubleCertification()) {
    candidate.doubleCertificationEligibility = false;
    return candidate;
  }

  const center = await certificationCenterRepository.getBySessionId({ sessionId: candidate.sessionId });

  if (!center.isHabilitated(candidate.subscription)) {
    candidate.doubleCertificationEligibility = false;
    return candidate;
  }

  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
  });

  candidate.doubleCertificationEligibility = certifiableBadgeAcquisitions.some(
    (b) => b.complementaryCertificationKey === candidate.subscription,
  );

  return candidate;
}
