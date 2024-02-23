export async function getCurrentActivity({ assessmentId, activityRepository }) {
  return await activityRepository.getLastActivity(assessmentId);
}
