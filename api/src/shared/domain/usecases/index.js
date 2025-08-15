import { deleteUnassociatedBadge } from './delete-unassociated-badge.js';
import { getAssessment } from './get-assessment.js';
import { updateAssessmentWithNextChallenge } from './update-assessment-with-next-challenge.js';
import { updateLastQuestionState } from './update-last-question-state.js';

const usecases = {
  deleteUnassociatedBadge,
  getAssessment,
  updateAssessmentWithNextChallenge,
  updateLastQuestionState,
};

const sharedUsecases = usecases;

export { sharedUsecases };
