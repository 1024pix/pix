import { NotFoundError } from '../errors';

export default async function getLastChallengeIdFromAssessmentId({ assessmentId, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${assessmentId}`);
  }

  return assessment.lastChallengeId;
}
