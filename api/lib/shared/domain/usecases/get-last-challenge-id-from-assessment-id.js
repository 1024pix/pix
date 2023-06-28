import { NotFoundError } from '../errors.js';

const getLastChallengeIdFromAssessmentId = async function ({ assessmentId, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  return assessment.lastChallengeId;
};

export { getLastChallengeIdFromAssessmentId };
