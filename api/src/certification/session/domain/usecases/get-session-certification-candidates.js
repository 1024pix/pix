/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */
import { EnrolledCandidate } from '../read-models/EnrolledCandidate.js';
import bluebird from 'bluebird';
import { constants as infraConstants } from '../../../../../lib/infrastructure/constants.js';

/**
 * @function
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 * @returns {EnrolledCandidate}
 * @throws {NotFoundError} a candidate is linked to an unexisting complementary certification
 */
const getSessionCertificationCandidates = async function ({
  sessionId,
  candidateRepository,
  complementaryCertificationRepository,
}) {
  const candidates = await candidateRepository.findBySessionId(sessionId);

  const complementaryCertifications = await getUniqComplementaryCertifications({
    candidates,
    complementaryCertificationRepository,
  });

  return candidates.map((candidate) => {
    return EnrolledCandidate.fromCandidateAndComplementaryCertification({
      candidate,
      complementaryCertification: complementaryCertifications.find(
        (complementaryCertification) => complementaryCertification?.id === candidate.complementaryCertificationId,
      ),
    });
  });
};

export { getSessionCertificationCandidates };

const _isRegisteredForAComplementaryCertification = (candidate) => !!candidate.complementaryCertificationId;
const _addComplementaryCertificationIdFromCandidate = (set, candidate) =>
  set.add(candidate.complementaryCertificationId);

/**
 * @param {Object} params
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
const getUniqComplementaryCertifications = async ({ candidates, complementaryCertificationRepository }) => {
  return bluebird
    .filter(candidates, _isRegisteredForAComplementaryCertification)
    .reduce(_addComplementaryCertificationIdFromCandidate, new Set())
    .map(
      async (complementaryCertificationId) =>
        complementaryCertificationRepository.getById({ complementaryCertificationId }),
      { concurrency: infraConstants.CONCURRENCY_HEAVY_OPERATIONS },
    );
};
