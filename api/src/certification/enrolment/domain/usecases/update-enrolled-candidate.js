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
  const foundedCandidate = await enrolledCandidateRepository.get({ id: editedCandidate.id });

  if (!foundedCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  if (foundedCandidate.isLinkedToAUser()) {
    throw new CandidateAlreadyLinkedToUserError();
  }

  const candidate = new Candidate({
    ...foundedCandidate,
    accessibilityAdjustmentNeeded: editedCandidate.accessibilityAdjustmentNeeded,
  });

  return enrolledCandidateRepository.update({ candidate });
};

export { updateEnrolledCandidate };
