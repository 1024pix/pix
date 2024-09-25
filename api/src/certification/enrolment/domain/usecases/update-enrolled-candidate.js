/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 */

import {
  CandidateAlreadyLinkedToUserError,
  CertificationCandidateNotFoundError,
} from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {EditedCandidate} params.editedCandidate
 * @param {CandidateRepository} params.candidateRepository
 */
const updateEnrolledCandidate = async function ({ editedCandidate, candidateRepository }) {
  const foundCandidate = await candidateRepository.get({ certificationCandidateId: editedCandidate.id });

  if (!foundCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  if (foundCandidate.isReconciled()) {
    throw new CandidateAlreadyLinkedToUserError();
  }

  foundCandidate.updateAccessibilityAdjustmentNeededStatus(editedCandidate.accessibilityAdjustmentNeeded);

  return candidateRepository.update(foundCandidate);
};

export { updateEnrolledCandidate };
