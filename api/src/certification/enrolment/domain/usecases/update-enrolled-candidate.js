/**
 * @typedef {import('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 */

import {
  CandidateAlreadyLinkedToUserError,
  CertificationCandidateNotFoundError,
} from '../../../../shared/domain/errors.js';
import { Candidate } from '../models/Candidate.js';

/**
 * @param {Object} params
 * @param {EditedCandidate} params.editedCandidate
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 */
const updateEnrolledCandidate = async function ({ editedCandidate, enrolledCandidateRepository }) {
  const foundCandidate = await enrolledCandidateRepository.get({ id: editedCandidate.id });

  if (!foundCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  if (foundCandidate.isLinkedToAUser()) {
    throw new CandidateAlreadyLinkedToUserError();
  }

  const candidate = new Candidate({
    ...foundCandidate,
    accessibilityAdjustmentNeeded: editedCandidate.accessibilityAdjustmentNeeded,
  });

  return enrolledCandidateRepository.update({ candidate });
};

export { updateEnrolledCandidate };
