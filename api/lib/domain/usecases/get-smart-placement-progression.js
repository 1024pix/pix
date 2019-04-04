const SmartPlacementProgression = require('../../../lib/domain/models/SmartPlacementProgression');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = async function getSmartPlacementProgression(
  {
    smartPlacementProgressionId,
    userId,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository
  }) {

  const assessmentId = SmartPlacementProgression.getAssessmentIdFromId(smartPlacementProgressionId);

  const assessment = await smartPlacementAssessmentRepository.get(assessmentId);
  if (assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElementsBeforeSharedDate = await smartPlacementKnowledgeElementRepository.findUniqByUserId(userId, assessment.campaignParticipation.sharedAt);

  return new SmartPlacementProgression({
    id: smartPlacementProgressionId,
    targetedSkills: assessment.targetProfile.skills,
    knowledgeElements: knowledgeElementsBeforeSharedDate,
    isProfileCompleted: assessment.isCompleted
  });

};
